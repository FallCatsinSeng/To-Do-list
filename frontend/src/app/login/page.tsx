'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import styles from './login.module.css';
import type { AuthResponse } from '@/types';

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post<AuthResponse>('/auth/login', {
                email,
                password,
            });

            const { token, user } = response.data;
            setAuth(user, token);

            // Redirect based on role
            if (user.role === 'admin') {
                router.push('/admin/dashboard');
            } else if (user.role === 'guru') {
                router.push('/guru/dashboard');
            } else {
                router.push('/user/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Email atau password salah!');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Redirect to backend OAuth endpoint
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        window.location.href = `${apiUrl}/api/auth/google/login`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2>Login</h2>

                {error && <p className={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        required
                    />

                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? 'Loading...' : 'Masuk'}
                    </button>

                    <div className={styles.divider}>atau</div>

                    <button
                        type="button"
                        className={styles.googleBtn}
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                            <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
                            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                        </svg>
                        Sign in with Google
                    </button>

                    <div className={styles.link}>
                        Belum punya akun? <Link href="/register">Daftar</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
