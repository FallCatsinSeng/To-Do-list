'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Assignment, AssignmentSubmission } from '@/types';
import styles from './detail.module.css';

export default function TugasDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/mahasiswa/assignments/${id}`);
                setAssignment(res.data.data?.assignment);
                setSubmission(res.data.data?.submission);
            } catch (error) {
                console.error('Failed to fetch assignment:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleSubmit = async () => {
        if (!confirm('Submit tugas ini?')) return;

        setSubmitting(true);
        try {
            await api.post(`/mahasiswa/assignments/${id}/submit`);
            alert('Tugas berhasil di-submit!');

            // Refresh data
            const res = await api.get(`/api/mahasiswa/assignments/${id}`);
            setAssignment(res.data.data?.assignment);
            setSubmission(res.data.data?.submission);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Gagal submit tugas');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Memuat...</div>;
    }

    if (!assignment) {
        return <div className={styles.loading}>Tugas tidak ditemukan</div>;
    }

    return (
        <div className={styles.container}>
            <button className={styles.backBtn} onClick={() => router.back()}>
                ← Kembali
            </button>

            <div className={styles.assignmentCard}>
                <h1 className={styles.title}>{assignment.title}</h1>
                {assignment.due_date && (
                    <p className={styles.dueDate}>
                        🕒 Deadline: {new Date(assignment.due_date).toLocaleString('id-ID')}
                    </p>
                )}
                <p className={styles.description}>{assignment.description || 'Tidak ada deskripsi'}</p>
            </div>

            <div className={styles.submissionSection}>
                <h2>Status Pengerjaan</h2>

                {submission ? (
                    <div className={styles.submissionCard}>
                        <div className={styles.statusBadge}>
                            {submission.status === 'pending' && '⏳ Belum Submit'}
                            {submission.status === 'submitted' && '✓ Sudah Submit'}
                            {submission.status === 'graded' && '⭐ Sudah Dinilai'}
                        </div>

                        {submission.status === 'submitted' && submission.submitted_at && (
                            <p className={styles.submittedAt}>
                                Di-submit pada: {new Date(submission.submitted_at).toLocaleString('id-ID')}
                            </p>
                        )}

                        {submission.status === 'graded' && (
                            <>
                                <div className={styles.gradeCard}>
                                    <h3>Nilai Anda</h3>
                                    <div className={styles.grade}>{submission.grade}</div>
                                </div>
                                {submission.feedback && (
                                    <div className={styles.feedback}>
                                        <h4>Feedback dari Guru:</h4>
                                        <p>{submission.feedback}</p>
                                    </div>
                                )}
                            </>
                        )}

                        {submission.status === 'pending' && (
                            <button
                                className={styles.submitBtn}
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? 'Mengirim...' : '✓ Submit Tugas'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={styles.noSubmission}>
                        <p>Anda belum memiliki submission untuk tugas ini</p>
                        <button
                            className={styles.submitBtn}
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Mengirim...' : '✓ Submit Tugas'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
