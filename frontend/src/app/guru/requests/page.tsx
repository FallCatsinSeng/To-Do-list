'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { MahasiswaGuru } from '@/types';
import styles from './requests.module.css';

export default function RequestsPage() {
    const [requests, setRequests] = useState<MahasiswaGuru[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/guru/requests');
            console.log('=== REQUESTS DEBUG ===');
            console.log('Response:', res);
            console.log('Data:', res.data);
            console.log('Requests array:', res.data.data);
            setRequests(res.data.data || []);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: number) => {
        if (!confirm('Approve permintaan ini?')) return;

        try {
            await api.post(`/guru/requests/${id}/approve`);
            alert('Permintaan berhasil di-approve');
            fetchRequests();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Gagal approve permintaan');
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Reject permintaan ini?')) return;

        try {
            await api.post(`/guru/requests/${id}/reject`);
            alert('Permintaan berhasil di-reject');
            fetchRequests();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Gagal reject permintaan');
        }
    };

    if (loading) {
        return <div className={styles.loading}>Memuat...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Permintaan Mahasiswa</h1>
            <p className={styles.subtitle}>
                {requests.length} permintaan pending
            </p>

            {requests.length === 0 ? (
                <div className={styles.empty}>
                    <span style={{ fontSize: '64px' }}>✅</span>
                    <h3>Tidak ada permintaan pending</h3>
                    <p>Semua permintaan sudah diproses</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {requests.map((req) => (
                        <div key={req.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <h3>{req.mahasiswa?.nama || 'Unknown'}</h3>
                                    <p>{req.mahasiswa?.email}</p>
                                </div>
                                <span className={styles.badge}>Pending</span>
                            </div>

                            <div className={styles.cardInfo}>
                                <p>
                                    <strong>Tanggal:</strong>{' '}
                                    {new Date(req.created_at).toLocaleDateString('id-ID')}
                                </p>
                            </div>

                            <div className={styles.actions}>
                                <button
                                    className={styles.approveBtn}
                                    onClick={() => handleApprove(req.id)}
                                >
                                    ✓ Approve
                                </button>
                                <button
                                    className={styles.rejectBtn}
                                    onClick={() => handleReject(req.id)}
                                >
                                    ✗ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
