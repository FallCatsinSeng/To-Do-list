'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Assignment, AssignmentSubmission } from '@/types';
import styles from './detail.module.css';

export default function AssignmentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [gradingId, setGradingId] = useState<number | null>(null);
    const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assignRes, subsRes] = await Promise.all([
                    api.get(`/api/guru/assignments`),
                    api.get(`/api/guru/assignments/${id}/submissions`),
                ]);

                const foundAssignment = assignRes.data.data?.find((a: Assignment) => a.id === parseInt(id));
                setAssignment(foundAssignment || null);
                setSubmissions(subsRes.data.data || []);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleGrade = async (submissionId: number) => {
        if (!gradeData.grade) {
            alert('Mohon masukkan nilai');
            return;
        }

        try {
            await api.post(`/api/guru/assignments/${submissionId}/grade`, {
                grade: parseFloat(gradeData.grade),
                feedback: gradeData.feedback,
            });

            alert('Nilai berhasil diberikan!');
            setGradingId(null);
            setGradeData({ grade: '', feedback: '' });

            // Refresh submissions
            const res = await api.get(`/api/guru/assignments/${id}/submissions`);
            setSubmissions(res.data.data || []);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Gagal memberi nilai');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Hapus tugas ini? Semua submission akan dihapus.')) return;

        try {
            await api.delete(`/api/guru/assignments/${id}`);
            alert('Tugas berhasil dihapus');
            router.push('/guru/assignments');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Gagal menghapus tugas');
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
                <div className={styles.assignmentHeader}>
                    <div>
                        <h1 className={styles.title}>{assignment.title}</h1>
                        {assignment.due_date && (
                            <p className={styles.dueDate}>
                                🕒 Deadline: {new Date(assignment.due_date).toLocaleString('id-ID')}
                            </p>
                        )}
                    </div>
                    <button className={styles.deleteBtn} onClick={handleDelete}>
                        🗑️ Hapus
                    </button>
                </div>
                <p className={styles.description}>{assignment.description || 'Tidak ada deskripsi'}</p>
            </div>

            <div className={styles.submissionsSection}>
                <h2>Submissions ({submissions.length})</h2>

                {submissions.length === 0 ? (
                    <div className={styles.empty}>
                        <span style={{ fontSize: '48px' }}>📭</span>
                        <p>Belum ada submission</p>
                    </div>
                ) : (
                    <div className={styles.submissionsList}>
                        {submissions.map((sub) => (
                            <div key={sub.id} className={styles.submissionCard}>
                                <div className={styles.submissionHeader}>
                                    <div>
                                        <h3>{sub.mahasiswa?.nama || 'Unknown'}</h3>
                                        <p className={styles.submissionMeta}>
                                            {sub.status === 'submitted' ? (
                                                <>✓ Submitted pada {new Date(sub.submitted_at!).toLocaleString('id-ID')}</>
                                            ) : sub.status === 'graded' ? (
                                                <>⭐ Graded</>
                                            ) : (
                                                <>⏳ Pending</>
                                            )}
                                        </p>
                                    </div>
                                    {sub.status === 'graded' && (
                                        <div className={styles.gradeBadge}>
                                            Nilai: {sub.grade}
                                        </div>
                                    )}
                                </div>

                                {sub.status === 'graded' && sub.feedback && (
                                    <div className={styles.feedback}>
                                        <strong>Feedback:</strong>
                                        <p>{sub.feedback}</p>
                                    </div>
                                )}

                                {sub.status === 'submitted' && (
                                    <>
                                        {gradingId === sub.id ? (
                                            <div className={styles.gradeForm}>
                                                <input
                                                    type="number"
                                                    placeholder="Nilai (0-100)"
                                                    value={gradeData.grade}
                                                    onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                                                    className={styles.input}
                                                    min="0"
                                                    max="100"
                                                />
                                                <textarea
                                                    placeholder="Feedback (opsional)"
                                                    value={gradeData.feedback}
                                                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                                    className={styles.textarea}
                                                    rows={3}
                                                />
                                                <div className={styles.gradeActions}>
                                                    <button
                                                        className={styles.cancelGradeBtn}
                                                        onClick={() => setGradingId(null)}
                                                    >
                                                        Batal
                                                    </button>
                                                    <button
                                                        className={styles.saveGradeBtn}
                                                        onClick={() => handleGrade(sub.id)}
                                                    >
                                                        Simpan Nilai
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                className={styles.gradeBtn}
                                                onClick={() => setGradingId(sub.id)}
                                            >
                                                ⭐ Beri Nilai
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
