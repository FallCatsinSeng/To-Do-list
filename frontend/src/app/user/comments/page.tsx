'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import styles from './comments.module.css';

export default function UserCommentsPage() {
    const { user } = useAuthStore();
    const [comments, setComments] = useState<any[]>([]);
    const [comment, setComment] = useState('');

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            const response = await api.get('/comments');
            setComments(response.data.data || []);
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    };

    const addComment = async () => {
        if (comment.trim() === '') {
            alert('Komentar tidak boleh kosong!');
            return;
        }

        try {
            await api.post('/comments', { comment });
            setComment('');
            loadComments();
        } catch (error) {
            alert('Gagal menambah komentar');
        }
    };

    const deleteComment = async (id: number) => {
        if (!confirm('Hapus komentar ini?')) return;

        try {
            await api.delete(`/comments/${id}`);
            loadComments();
        } catch (error) {
            alert('Gagal menghapus komentar');
        }
    };

    return (
        <div className={styles.commentWrapper}>
            <h2>💬 Komentar Pengguna</h2>

            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Tulis komentar..."
            />
            <button className={styles.btnSend} onClick={addComment}>
                Kirim
            </button>

            <div className={styles.commentList}>
                {comments.map((c) => (
                    <div key={c.id} className={styles.commentBox}>
                        <div className={styles.commentContent}>
                            <div className={styles.commentName}>{c.user?.nama || 'User'}</div>
                            <div className={styles.commentTime}>
                                {new Date(c.created_at).toLocaleString('id-ID')}
                            </div>
                            <div className={styles.commentText}>{c.comment}</div>

                            {c.user_id === user?.id && (
                                <button className={styles.btnDelete} onClick={() => deleteComment(c.id)}>
                                    Hapus
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
