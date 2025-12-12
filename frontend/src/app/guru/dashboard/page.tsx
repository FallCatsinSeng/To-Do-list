'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import styles from './dashboard.module.css';

export default function GuruDashboard() {
    const [stats, setStats] = useState({
        totalMahasiswa: 0,
        pendingRequests: 0,
        totalAssignments: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [mahasiswaRes, requestsRes, assignmentsRes] = await Promise.all([
                    api.get('/guru/mahasiswa'),
                    api.get('/guru/requests'),
                    api.get('/guru/assignments'),
                ]);

                setStats({
                    totalMahasiswa: mahasiswaRes.data.data?.length || 0,
                    pendingRequests: requestsRes.data.data?.length || 0,
                    totalAssignments: assignmentsRes.data.data?.length || 0,
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Memuat...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Dashboard Guru</h1>
            <p className={styles.subtitle}>Selamat datang di panel guru</p>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statInfo}>
                        <h3>{stats.totalMahasiswa}</h3>
                        <p>Total Mahasiswa</p>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.pending}`}>
                    <div className={styles.statIcon}>⏳</div>
                    <div className={styles.statInfo}>
                        <h3>{stats.pendingRequests}</h3>
                        <p>Permintaan Pending</p>
                    </div>
                </div>

                <div className={`${styles.statCard} ${styles.assignments}`}>
                    <div className={styles.statIcon}>📝</div>
                    <div className={styles.statInfo}>
                        <h3>{stats.totalAssignments}</h3>
                        <p>Total Tugas</p>
                    </div>
                </div>
            </div>

            <div className={styles.quickActions}>
                <h2>Quick Actions</h2>
                <div className={styles.actionButtons}>
                    <a href="/guru/requests" className={styles.actionBtn}>
                        <span>👥</span>
                        <div>
                            <strong>Lihat Permintaan</strong>
                            <p>Review permintaan mahasiswa</p>
                        </div>
                    </a>
                    <a href="/guru/assignments/new" className={styles.actionBtn}>
                        <span>➕</span>
                        <div>
                            <strong>Buat Tugas Baru</strong>
                            <p>Tambahkan tugas untuk mahasiswa</p>
                        </div>
                    </a>
                    <a href="/guru/mahasiswa" className={styles.actionBtn}>
                        <span>📚</span>
                        <div>
                            <strong>Daftar Mahasiswa</strong>
                            <p>Lihat mahasiswa yang di-approve</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
