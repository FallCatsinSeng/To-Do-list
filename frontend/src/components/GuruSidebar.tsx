'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import styles from './GuruSidebar.module.css';

export default function GuruSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearAuth, updateUser } = useAuthStore();
    const [uploading, setUploading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
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

            if (user) {
                updateUser({ ...user, foto: res.data.foto });
            }
            alert('Foto profil berhasil diperbarui!');
        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(error.response?.data?.error || 'Gagal upload foto profil');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Fetch pending requests count
    useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                const res = await api.get('/api/guru/requests');
                setPendingCount(res.data.data?.length || 0);
            } catch (error) {
                console.error('Failed to fetch pending requests:', error);
            }
        };

        if (user?.role === 'guru') {
            fetchPendingCount();
        }
    }, [user]);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <>
            {/* Hamburger button */}
            <button className={styles.hamburger} onClick={toggleSidebar} aria-label="Toggle sidebar">
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Overlay */}
            {sidebarOpen && <div className={`${styles.overlay} ${styles.overlayOpen}`} onClick={() => setSidebarOpen(false)}></div>}

            {/* Sidebar */}
            <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
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
                    <h3>{user?.nama || 'Guru'}</h3>
                    <p>Guru</p>
                </div>

                <h2>Guru Panel</h2>

                <Link
                    href="/guru/dashboard"
                    className={isActive('/guru/dashboard') ? styles.active : ''}
                >
                    <span>🏠</span> Dashboard
                </Link>

                <Link
                    href="/guru/requests"
                    className={isActive('/guru/requests') ? styles.active : ''}
                >
                    <span>👥</span> Permintaan Mahasiswa
                    {pendingCount > 0 && (
                        <span className={styles.badge}>{pendingCount}</span>
                    )}
                </Link>

                <Link
                    href="/guru/mahasiswa"
                    className={isActive('/guru/mahasiswa') ? styles.active : ''}
                >
                    <span>📚</span> Daftar Mahasiswa
                </Link>

                <Link
                    href="/guru/assignments"
                    className={isActive('/guru/assignments') ? styles.active : ''}
                >
                    <span>📝</span> Tugas
                </Link>

                <button onClick={handleLogout} className={styles.logout}>
                    <span>🚪</span> Logout
                </button>
            </div>
        </>
    );
}
