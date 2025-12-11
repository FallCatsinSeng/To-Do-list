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
            } else {
                router.push('/user/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Email atau password salah!');
        } finally {
            setLoading(false);
        }
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

                    <div className={styles.link}>
                        Belum punya akun? <Link href="/register">Daftar</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
