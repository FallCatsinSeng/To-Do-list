'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import styles from './new.module.css';

export default function NewAssignmentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        due_date: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Convert datetime-local to ISO format if due_date exists
            const payload = {
                title: formData.title,
                description: formData.description,
                due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
            };

            await api.post('/guru/assignments', payload);
            alert('Tugas berhasil dibuat!');
            router.push('/guru/assignments');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Gagal membuat tugas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Buat Tugas Baru</h1>
                <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => router.back()}
                >
                    ← Kembali
                </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="title">
                        Judul Tugas <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="Masukkan judul tugas"
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description">Deskripsi</label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Jelaskan detail tugas (opsional)"
                        className={styles.textarea}
                        rows={6}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="due_date">Deadline</label>
                    <input
                        type="datetime-local"
                        id="due_date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className={styles.input}
                    />
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? 'Menyimpan...' : '✓ Simpan Tugas'}
                    </button>
                </div>
            </form>
        </div>
    );
}
