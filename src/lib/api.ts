import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Token refresh queue handling
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = Cookies.get('refresh_token');

                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    Cookies.set('access_token', access, { expires: 1 / 24, sameSite: 'Lax', path: '/' }); // 1 hour

                    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                    originalRequest.headers.Authorization = `Bearer ${access}`;

                    onRefreshed(access);
                    return api(originalRequest);
                } else {
                    throw new Error('No refresh token');
                }
            } catch (refreshError) {
                Cookies.remove('access_token', { path: '/' });
                Cookies.remove('refresh_token', { path: '/' });

                // Force global logout via event (listened by auth-store)
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('auth:logout'));
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
