'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { User } from '@/types';
import styles from './pilih-guru.module.css';

export default function PilihGuruPage() {
    const [gurus, setGurus] = useState<User[]>([]);
    const [myGuru, setMyGuru] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [gurusRes, myGuruRes] = await Promise.all([
                api.get('/mahasiswa/guru/all'),
                api.get('/mahasiswa/guru/my').catch(() => ({ data: { data: null } })),
            ]);

            setGurus(gurusRes.data.data || []);
            setMyGuru(myGuruRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRequest = async (guruId: number) => {
        if (!confirm('Kirim permintaan ke guru ini?')) return;

        try {
            await api.post('/mahasiswa/guru/request', { guru_id: guruId });
            alert('Permintaan berhasil dikirim!');
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Gagal mengirim permintaan');
        }
    };

    if (loading) {
        return <div className={styles.loading}>Memuat...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Pilih Guru</h1>

            {myGuru && (
                <div className={styles.currentGuru}>
                    <h2>Guru Saat Ini</h2>
                    <div className={styles.guruCard}>
                        <div className={styles.avatar}>
                            {myGuru.guru?.nama?.charAt(0) || 'G'}
                        </div>
                        <div>
                            <h3>{myGuru.guru?.nama}</h3>
                            <p>{myGuru.guru?.email}</p>
                            <span className={`${styles.badge} ${styles[myGuru.status]}`}>
                                {myGuru.status === 'pending' ? '⏳ Pending' :
                                    myGuru.status === 'approved' ? '✓ Approved' :
                                        '✗ Rejected'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <h2>Daftar Guru Tersedia</h2>
            <p className={styles.subtitle}>{gurus.length} guru tersedia</p>

            {gurus.length === 0 ? (
                <div className={styles.empty}>
                    <span style={{ fontSize: '64px' }}>👨‍🏫</span>
                    <p>Belum ada guru tersedia</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {gurus.map((guru) => (
                        <div key={guru.id} className={styles.card}>
                            <div className={styles.avatar}>
                                {guru.nama?.charAt(0) || 'G'}
                            </div>
                            <div className={styles.cardContent}>
                                <h3>{guru.nama}</h3>
                                <p>{guru.email}</p>
                                {!myGuru && (
                                    <button
                                        className={styles.requestBtn}
                                        onClick={() => handleRequest(guru.id)}
                                    >
                                        Kirim Permintaan
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
