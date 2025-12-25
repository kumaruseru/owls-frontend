/**
 * Auth Store using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import api from '@/lib/api';

export interface User {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone: string;
    avatar: string | null;
    address: string;
    city: string;
    district: string;
    ward: string;
    full_name: string;
    full_address: string;
    date_joined: string;
    is_email_verified: boolean;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    setUser: (user: User | null) => void;
}

interface RegisterData {
    email: string;
    username: string;
    password: string;
    password2: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/users/login/', { email, password });
                    const { access, refresh } = response.data;

                    Cookies.set('access_token', access, { expires: 1 / 24 }); // 1 hour
                    Cookies.set('refresh_token', refresh, { expires: 7 }); // 7 days

                    // Fetch user profile
                    await get().fetchProfile();
                    set({ isAuthenticated: true });
                } finally {
                    set({ isLoading: false });
                }
            },

            register: async (data: RegisterData) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/users/register/', data);
                    const { tokens, user } = response.data;

                    Cookies.set('access_token', tokens.access, { expires: 1 / 24 });
                    Cookies.set('refresh_token', tokens.refresh, { expires: 7 });

                    set({ user, isAuthenticated: true });
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                try {
                    const refreshToken = Cookies.get('refresh_token');
                    if (refreshToken) {
                        await api.post('/users/logout/', { refresh: refreshToken });
                    }
                } catch (error) {
                    // Ignore errors on logout
                } finally {
                    Cookies.remove('access_token');
                    Cookies.remove('refresh_token');
                    set({ user: null, isAuthenticated: false });
                }
            },

            fetchProfile: async () => {
                try {
                    const response = await api.get('/users/profile/');
                    set({ user: response.data, isAuthenticated: true });
                } catch (error) {
                    set({ user: null, isAuthenticated: false });
                }
            },

            updateProfile: async (data: Partial<User>) => {
                const response = await api.patch('/users/profile/', data);
                set({ user: response.data.user });
            },

            setUser: (user: User | null) => {
                set({ user, isAuthenticated: !!user });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
