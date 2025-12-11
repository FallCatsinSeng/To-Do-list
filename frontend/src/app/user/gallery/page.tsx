'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import styles from './gallery.module.css';

export default function UserGalleryPage() {
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        try {
            const response = await api.get('/gallery');
            setPhotos(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch photos:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus foto ini?')) return;

        try {
            await api.delete(`/gallery/${id}`);
            fetchPhotos();
        } catch (error) {
            alert('Gagal menghapus foto');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('photos', files[i]);
        }

        setLoading(true);
        try {
            await api.post('/gallery/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchPhotos();
            e.target.value = '';
        } catch (error: any) {
            alert(error.response?.data?.error || 'Gagal upload foto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.mainContent}>
            <h2>Galeri Foto Saya</h2>

            <div className={styles.uploadSection}>
                <label htmlFor="fileInput" className={styles.uploadBtn}>
                    + Upload Foto
                </label>
                <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleUpload}
                    style={{ display: 'none' }}
                    disabled={loading}
                />
                {loading && <span>Uploading...</span>}
            </div>

            <div className={styles.gallery}>
                {photos.length > 0 ? (
                    photos.map((photo) => (
                        <div key={photo.id} className={styles.item}>
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/gallery/${photo.filename}`}
                                alt="Gallery"
                            />
                            <button
                                className={styles.deleteBtn}
                                onClick={() => handleDelete(photo.id)}
                            >
                                Hapus
                            </button>
                        </div>
                    ))
                ) : (
                    <p className={styles.noPhoto}>Belum ada foto.</p>
                )}
            </div>
        </div>
    );
}
