'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import styles from './UserSidebar.module.css';

export default function UserSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearAuth } = useAuthStore();

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    const isActive = (path: string) => pathname === path;

    const foto = user?.foto ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${user.foto}` : '/default.png';

    return (
        <div className={styles.sidebar}>
            <div className={styles.userProfile}>
                <img src={foto} alt="Foto Profil" />
                <h3>{user?.nama || 'User'}</h3>
                <p>User</p>
            </div>

            <h2>User Panel</h2>

            <Link
                href="/user/dashboard"
                className={isActive('/user/dashboard') ? styles.active : ''}
            >
                <span>🏠</span> Dashboard
            </Link>

            <Link
                href="/user/gallery"
                className={isActive('/user/gallery') ? styles.active : ''}
            >
                <span>📷</span> Lihat Galeri
            </Link>

            <Link
                href="/user/todo"
                className={isActive('/user/todo') ? styles.active : ''}
            >
                <span>📝</span> To-do List
            </Link>

            <Link
                href="/user/comments"
                className={isActive('/user/comments') ? styles.active : ''}
            >
                <span>💬</span> Komentar
            </Link>

            <button onClick={handleLogout} className={styles.logout}>
                <span>🚪</span> Logout
            </button>
        </div>
    );
}
