import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = Cookies.get('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    Cookies.set('access_token', access, { expires: 1 / 24 });

                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed - clear tokens
                    Cookies.remove('access_token');
                    Cookies.remove('refresh_token');

                    // Redirect to login if on client
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
