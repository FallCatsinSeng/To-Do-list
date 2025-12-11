import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    updateUser: (user: User) => void;
    clearAuth: () => void;
    isAuthenticated: () => boolean;
    isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            setAuth: (user, token) => {
                set({ user, token });
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                }
            },
            updateUser: (user) => {
                set((state) => ({ ...state, user }));
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(user));
                }
            },
            clearAuth: () => {
                set({ user: null, token: null });
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            },
            isAuthenticated: () => !!get().token,
            isAdmin: () => get().user?.role === 'admin',
        }),
        {
            name: 'auth-storage',
        }
    )
);
