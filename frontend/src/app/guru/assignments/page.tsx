'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Assignment } from '@/types';
import styles from './assignments.module.css';

export default function AssignmentsPage() {
    const router = useRouter();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await api.get('/guru/assignments');
                setAssignments(res.data.data || []);
            } catch (error) {
                console.error('Failed to fetch assignments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    if (loading) {
        return <div className={styles.loading}>Memuat...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Daftar Tugas</h1>
                    <p className={styles.subtitle}>{assignments.length} tugas telah dibuat</p>
                </div>
                <button
                    className={styles.createBtn}
                    onClick={() => router.push('/guru/assignments/new')}
                >
                    ➕ Buat Tugas Baru
                </button>
            </div>

            {assignments.length === 0 ? (
                <div className={styles.empty}>
                    <span style={{ fontSize: '64px' }}>📝</span>
                    <h3>Belum ada tugas</h3>
                    <p>Buat tugas pertama Anda untuk mahasiswa</p>
                    <button
                        className={styles.createBtn}
                        onClick={() => router.push('/guru/assignments/new')}
                    >
                        ➕ Buat Tugas Baru
                    </button>
                </div>
            ) : (
                <div className={styles.list}>
                    {assignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className={styles.card}
                            onClick={() => router.push(`/guru/assignments/${assignment.id}`)}
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
                            <div className={styles.cardFooter}>
                                <span className={styles.date}>
                                    Dibuat: {new Date(assignment.created_at).toLocaleDateString('id-ID')}
                                </span>
                                <span className={styles.viewBtn}>Lihat Detail →</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
