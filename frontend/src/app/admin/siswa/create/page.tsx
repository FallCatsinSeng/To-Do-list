'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import styles from './form.module.css';

export default function CreateStudentPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nim: '',
        nama: '',
        jurusan: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/students', formData);
            router.push('/admin/siswa');
        } catch (error) {
            alert('Gagal menambah siswa');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2>Tambah Siswa</h2>

                <form onSubmit={handleSubmit}>
                    <label>NIM</label>
                    <input
                        type="text"
                        value={formData.nim}
                        onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                        placeholder="Masukkan NIM..."
                        required
                    />

                    <label>Nama</label>
                    <input
                        type="text"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        placeholder="Masukkan Nama..."
                        required
                    />

                    <label>Jurusan</label>
                    <input
                        type="text"
                        value={formData.jurusan}
                        onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                        placeholder="Masukkan Jurusan..."
                        required
                    />

                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? 'Loading...' : 'SIMPAN'}
                    </button>
                </form>

                <a href="/admin/siswa" className={styles.back}>← Kembali ke daftar siswa</a>
            </div>
        </div>
    );
}
