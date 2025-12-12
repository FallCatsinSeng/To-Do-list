'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Assignment } from '@/types';
import styles from './tugas.module.css';

export default function TugasPage() {
    const router = useRouter();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [myGuru, setMyGuru] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assignmentsRes, guruRes] = await Promise.all([
                    api.get('/mahasiswa/assignments'),
                    api.get('/mahasiswa/guru/my').catch(() => ({ data: { data: null } })),
                ]);

                setAssignments(assignmentsRes.data.data || []);
                setMyGuru(guruRes.data.data);
            } catch (error) {
                console.error('Failed to fetch assignments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className={styles.loading}>Memuat...</div>;
    }

    if (!myGuru || myGuru.status !== 'approved') {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <span style={{ fontSize: '64px' }}>👨‍🏫</span>
                    <h3>Belum Memiliki Guru</h3>
                    <p>Silakan pilih guru terlebih dahulu untuk melihat tugas</p>
                    <button
                        className={styles.btn}
                        onClick={() => router.push('/user/pilih-guru')}
                    >
                        Pilih Guru
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Tugas dari {myGuru.guru?.nama}</h1>
            <p className={styles.subtitle}>{assignments.length} tugas</p>

            {assignments.length === 0 ? (
                <div className={styles.empty}>
                    <span style={{ fontSize: '64px' }}>📝</span>
                    <p>Belum ada tugas</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {assignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className={styles.card}
                            onClick={() => router.push(`/user/tugas/${assignment.id}`)}
                        >
                            <div className={styles.cardHeader}>
                                <h3>{assignment.title}</h3>
                                {assignment.due_date && (
                                    <span className={styles.dueDate}>
                                        🕒 {new Date(assignment.due_date).toLocaleDateString('id-ID')}
                                    </span>
                                )}
                            </div>
                            <p className={styles.description}>{assignment.description || 'Tidak ada deskripsi'}</p>
                            <button className={styles.viewBtn}>Lihat Detail →</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
