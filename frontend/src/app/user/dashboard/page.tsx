'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import styles from './dashboard.module.css';

export default function UserDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        totalPhotos: 0,
        totalTodo: 0,
    });
    const [recentPhotos, setRecentPhotos] = useState<any[]>([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [galleryRes, todoRes] = await Promise.all([
                api.get('/gallery'),
                api.get('/todos'),
            ]);

            setStats({
                totalPhotos: galleryRes.data.data?.length || 0,
                totalTodo: todoRes.data.data?.length || 0,
            });

            setRecentPhotos(galleryRes.data.data?.slice(0, 4) || []);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    return (
        <div className={styles.mainContent}>
            <div className={styles.top}>
                <div>
                    <div className={styles.welcome}>
                        Halo, <strong>{user?.nama}</strong>
                    </div>
                    <small>Selamat datang di dashboard pengguna</small>
                </div>
            </div>

            {/* Statistik */}
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3>Total Foto</h3>
                    <div className={styles.stat}>{stats.totalPhotos}</div>
                    <div className={styles.meta}>Foto yang kamu unggah</div>
                </div>

                <div className={styles.card}>
                    <h3>Total To-do</h3>
                    <div className={styles.stat}>{stats.totalTodo}</div>
                    <div className={styles.meta}>Tugas yang kamu buat</div>
                </div>

                <div className={`${styles.card} ${styles.cardLarge}`}>
                    <h3>Foto Terbaru</h3>
                    <div className={styles.photos}>
                        {recentPhotos.length > 0 ? (
                            recentPhotos.map((p) => (
                                <div key={p.id} className={styles.photoThumb}>
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/gallery/${p.filename}`}
                                        alt="Gallery"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className={styles.meta}>Belum ada foto.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Aktivitas */}
            <div className={`${styles.card} ${styles.activityCard}`}>
                <h3>Riwayat Aktivitas Terakhir</h3>
                <div className={styles.meta}>Tidak ada aktivitas.</div>
            </div>
        </div>
    );
}
