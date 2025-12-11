'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import styles from './register.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        password_confirm: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password_confirm) {
            setError('Password dan konfirmasi tidak sama!');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter!');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/register', {
                nama: formData.nama,
                email: formData.email,
                password: formData.password,
            });

            router.push('/login?reg=success');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registrasi gagal!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2>Buat Akun Baru</h2>

                {error && <p className={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <label>Nama Lengkap</label>
                    <input
                        type="text"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="Masukkan nama kamu"
                        required
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        required
                    />

                    <label>Konfirmasi Password</label>
                    <input
                        type="password"
                        value={formData.password_confirm}
                        onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                        placeholder="Ulangi password"
                        required
                    />

                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? 'Loading...' : 'Daftar'}
                    </button>

                    <div className={styles.link}>
                        Sudah punya akun? <Link href="/login">Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
