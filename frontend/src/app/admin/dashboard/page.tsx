'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import styles from './dashboard.module.css';

interface Stats {
    totalUser: number;
    totalFoto: number;
    totalUploader: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalUser: 0,
        totalFoto: 0,
        totalUploader: 0,
    });
    const [recentPhotos, setRecentPhotos] = useState<any[]>([]);

    useEffect(() => {
        fetchStats();
        fetchRecentPhotos();
    }, []);

    const fetchStats = async () => {
        try {
            // In real implementation, create dedicated stats endpoint
            // For now, we'll fetch from existing endpoints
            const [usersRes, galleryRes] = await Promise.all([
                api.get('/auth/me'), // Placeholder
                api.get('/gallery'),
            ]);

            setStats({
                totalUser: 0, // Would come from stats endpoint
                totalFoto: galleryRes.data.data?.length || 0,
                totalUploader: 0,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchRecentPhotos = async () => {
        try {
            const response = await api.get('/gallery');
            setRecentPhotos(response.data.data?.slice(0, 5) || []);
        } catch (error) {
            console.error('Failed to fetch photos:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Dashboard Admin</h1>

            <div className={styles.row}>
                <div className={styles.card}>
                    <h2>{stats.totalUser}</h2>
                    <p>Total User Terdaftar</p>
                </div>

                <div className={styles.card}>
                    <h2>{stats.totalFoto}</h2>
                    <p>Total Foto Galeri</p>
                </div>

                <div className={styles.card}>
                    <h2>{stats.totalUploader}</h2>
                    <p>Jumlah Uploader</p>
                </div>
            </div>

            <div className={styles.box}>
                <h3>Foto Terbaru</h3>

                <div className={styles.grid}>
                    {recentPhotos.length > 0 ? (
                        recentPhotos.map((photo) => (
                            <div key={photo.id} className={styles.imgCard}>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/gallery/${photo.filename}`}
                                    alt="Gallery"
                                />
                            </div>
                        ))
                    ) : (
                        <p>Belum ada foto di galeri.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
