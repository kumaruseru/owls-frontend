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
    // GHN Address IDs for sync
    province_id: number | null;
    district_id: number | null;
    ward_code: string | null;
    full_name: string;
    full_address: string;
    date_joined: string;
    is_email_verified: boolean;
    is_staff: boolean;
    is_2fa_enabled: boolean;
}

export interface SocialAccount {
    provider: string;
    uid: string;
    created_at: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasHydrated: boolean;
    socialAccounts: SocialAccount[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    login: (email: string, password: string) => Promise<any>;
    verify2FA: (tempToken: string, code: string, isBackup?: boolean) => Promise<void>;
    socialLogin: (provider: string, code: string) => Promise<void>;
    send2FAEmail: (tempToken: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    fetchSocialAccounts: () => Promise<void>;
    disconnectSocialAccount: (provider: string) => Promise<void>;
    setUser: (user: User | null) => void;
    setHasHydrated: (hydrated: boolean) => void;
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
            hasHydrated: false,
            socialAccounts: [],

            setHasHydrated: (hydrated: boolean) => {
                set({ hasHydrated: hydrated });
            },

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/login/', { email, password });

                    if (response.data.requires_2fa) {
                        return response.data;
                    }

                    const { access, refresh } = response.data;
                    Cookies.set('access_token', access, { expires: 1 / 24, sameSite: 'Lax', path: '/' }); // 1 hour
                    Cookies.set('refresh_token', refresh, { expires: 7, sameSite: 'Lax', path: '/' }); // 7 days

                    await get().fetchProfile();
                    set({ isAuthenticated: true });
                    return response.data;
                } finally {
                    set({ isLoading: false });
                }
            },

            verify2FA: async (tempToken: string, code: string, isBackup: boolean = false) => {
                set({ isLoading: true });
                try {
                    const payload = isBackup
                        ? { temp_token: tempToken, backup_code: code }
                        : { temp_token: tempToken, code };

                    const response = await api.post('/auth/login/2fa/', payload);
                    const { access, refresh } = response.data;

                    Cookies.set('access_token', access, { expires: 1 / 24, sameSite: 'Lax', path: '/' });
                    Cookies.set('refresh_token', refresh, { expires: 7, sameSite: 'Lax', path: '/' });

                    await get().fetchProfile();
                    set({ isAuthenticated: true });
                } finally {
                    set({ isLoading: false });
                }
            },

            socialLogin: async (provider: string, code: string) => {
                set({ isLoading: true });
                try {
                    const response = await api.post(`/auth/social/${provider}/callback/`, { code });
                    // If response returns tokens, it's a login or link
                    // But if account linking logic is inside callback view, it returns tokens or link confirmation?
                    // Currently my backend view returns tokens in both cases.

                    const { access, refresh } = response.data;

                    Cookies.set('access_token', access, { expires: 1 / 24, sameSite: 'Lax', path: '/' });
                    Cookies.set('refresh_token', refresh, { expires: 7, sameSite: 'Lax', path: '/' });

                    await get().fetchProfile();
                    set({ isAuthenticated: true });
                } finally {
                    set({ isLoading: false });
                }
            },

            send2FAEmail: async (tempToken: string) => {
                set({ isLoading: true });
                try {
                    await api.post('/auth/2fa/send-email/', { temp_token: tempToken });
                } finally {
                    set({ isLoading: false });
                }
            },

            register: async (data: RegisterData) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/register/', data);
                    const { user, access, refresh } = response.data;

                    Cookies.set('access_token', access, { expires: 1 / 24, sameSite: 'Lax', path: '/' });
                    Cookies.set('refresh_token', refresh, { expires: 7, sameSite: 'Lax', path: '/' });

                    set({ user, isAuthenticated: true });
                } finally {
                    set({ isLoading: false });
                }
            },

            fetchSocialAccounts: async () => {
                try {
                    const response = await api.get('/auth/social/accounts/');
                    set({ socialAccounts: response.data });
                } catch (error) {
                    console.error("Failed to fetch social accounts", error);
                }
            },

            disconnectSocialAccount: async (provider: string) => {
                set({ isLoading: true });
                try {
                    await api.post('/auth/social/disconnect/', { provider });
                    await get().fetchSocialAccounts();
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                try {
                    const refreshToken = Cookies.get('refresh_token');
                    if (refreshToken) {
                        await api.post('/auth/logout/', { refresh: refreshToken });
                    }
                } catch (error) {
                    // Ignore errors on logout
                } finally {
                    Cookies.remove('access_token', { path: '/' });
                    Cookies.remove('refresh_token', { path: '/' });
                    set({ user: null, isAuthenticated: false });
                }
            },

            fetchProfile: async () => {
                try {
                    const response = await api.get('/auth/profile/');
                    set({ user: response.data, isAuthenticated: true });
                } catch (error) {
                    set({ user: null, isAuthenticated: false });
                }
            },

            updateProfile: async (data: Partial<User>) => {
                await api.patch('/auth/profile/', data);
                await get().fetchProfile();
            },

            setUser: (user: User | null) => {
                set({ user, isAuthenticated: !!user });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);

                // Security Check: If no refresh token in cookies, force logout
                // This prevents "Ghost Logins" where localStorage says true but API calls fail
                const refreshToken = Cookies.get('refresh_token');
                if (!refreshToken && state?.isAuthenticated) {
                    state.setUser(null);
                }
            },
        }
    )
);

// Global event listener for forced logout from API interceptor
if (typeof window !== 'undefined') {
    window.addEventListener('auth:logout', () => {
        useAuthStore.getState().logout();
    });
}
