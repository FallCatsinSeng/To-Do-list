'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import styles from './UserSidebar.module.css';

export default function UserSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearAuth, updateUser } = useAuthStore();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogout = () => {
        clearAuth();
        router.push('/login');
    };

    const isActive = (path: string) => pathname === path;

    const foto = user?.foto ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/profiles/${user.foto}` : '/default.svg';

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi basic
        if (!file.type.startsWith('image/')) {
            alert('Mohon upload file gambar');
            return;
        }

        const formData = new FormData();
        formData.append('foto', file);

        setUploading(true);
        try {
            const res = await api.post('/auth/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Update user in store with new photo filename
            if (user) {
                updateUser({ ...user, foto: res.data.foto });
            }
            alert('Foto profil berhasil diperbarui!');
        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(error.response?.data?.error || 'Gagal upload foto profil');
        } finally {
            setUploading(false);
            // Reset input value agar bisa upload file yang sama jika perlu
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.userProfile}>
                <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }} onClick={handlePhotoClick} title="Klik untuk ganti foto">
                    <img
                        src={foto}
                        alt="Foto Profil"
                        style={{ display: 'block' }}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/default.svg';
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        background: '#4f46e5',
                        color: 'white',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        <span>📷</span>
                    </div>
                    {uploading && (
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(255,255,255,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%'
                        }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>...</span>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="image/*"
                />
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
