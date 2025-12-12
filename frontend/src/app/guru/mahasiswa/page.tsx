'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { MahasiswaGuru } from '@/types';
import styles from './mahasiswa.module.css';

export default function MahasiswaPage() {
    const [mahasiswa, setMahasiswa] = useState<MahasiswaGuru[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMahasiswa = async () => {
            try {
                const res = await api.get('/guru/mahasiswa');
                setMahasiswa(res.data.data || []);
            } catch (error) {
                console.error('Failed to fetch mahasiswa:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMahasiswa();
    }, []);

    if (loading) {
        return <div className={styles.loading}>Memuat...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Daftar Mahasiswa</h1>
            <p className={styles.subtitle}>
                {mahasiswa.length} mahasiswa yang telah di-approve
            </p>

            {mahasiswa.length === 0 ? (
                <div className={styles.empty}>
                    <span style={{ fontSize: '64px' }}>👥</span>
                    <h3>Belum ada mahasiswa</h3>
                    <p>Approve permintaan mahasiswa untuk melihat daftar mereka di sini</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {mahasiswa.map((item) => (
                        <div key={item.id} className={styles.card}>
                            <div className={styles.avatar}>
                                <span>{item.mahasiswa?.nama?.charAt(0) || 'M'}</span>
                            </div>
                            <div className={styles.cardContent}>
                                <h3>{item.mahasiswa?.nama || 'Unknown'}</h3>
                                <p className={styles.email}>{item.mahasiswa?.email}</p>
                                <div className={styles.meta}>
                                    <span>
                                        ✓ Approved pada {new Date(item.updated_at).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
