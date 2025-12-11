'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import styles from './AdminSidebar.module.css';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { clearAuth } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className={styles.sidebar}>
            <h2>Admin Panel</h2>

            <div className={styles.menu}>
                <Link
                    href="/admin/dashboard"
                    className={isActive('/admin/dashboard') ? styles.active : ''}
                >
                    Dashboard
                </Link>

                <Link
                    href="/admin/siswa"
                    className={isActive('/admin/siswa') ? styles.active : ''}
                >
                    Kelola Siswa
                </Link>

                <Link
                    href="/admin/gallery"
                    className={isActive('/admin/gallery') ? styles.active : ''}
                >
                    Kelola Galeri
                </Link>

                <Link
                    href="/admin/comments"
                    className={isActive('/admin/comments') ? styles.active : ''}
                >
                    Komentar
                </Link>

                <Link
                    href="/admin/todo"
                    className={isActive('/admin/todo') ? styles.active : ''}
                >
                    Daftar To-do
                </Link>

                <button onClick={handleLogout} className={styles.logout}>
                    Logout
                </button>
            </div>
        </div>
    );
}
