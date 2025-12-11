'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import type { Student, ApiResponse } from '@/types';
import styles from './siswa.module.css';

export default function SiswaPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, [page, search]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await api.get<ApiResponse<Student[]>>('/students', {
                params: { page, limit: 10, search },
            });
            setStudents(response.data.data || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus siswa ini?')) return;

        try {
            await api.delete(`/students/${id}`);
            fetchStudents();
        } catch (error) {
            alert('Gagal menghapus siswa');
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchStudents();
    };

    return (
        <div className={styles.container}>
            <h2>Kelola Siswa</h2>

            <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama atau NIM..."
                />
                <button type="submit" className={styles.btnBlue}>Cari</button>
                <Link href="/admin/siswa/create" className={styles.btnGreen}>
                    + Tambah Siswa
                </Link>
                <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/students/export/csv`}
                    className={styles.btnOrange}>
                    Export CSV
                </a>
            </form>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>NIM</th>
                        <th>Nama</th>
                        <th>Jurusan</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={5}>Loading...</td></tr>
                    ) : students.length > 0 ? (
                        students.map((student) => (
                            <tr key={student.id}>
                                <td>{student.id}</td>
                                <td>{student.nim}</td>
                                <td>{student.nama}</td>
                                <td>{student.jurusan}</td>
                                <td>
                                    <Link href={`/admin/siswa/${student.id}/edit`} className={styles.btnBlue}>
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(student.id)} className={styles.btnRed}>
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={5}>Tidak ada data</td></tr>
                    )}
                </tbody>
            </table>

            <div className={styles.pagination}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={p === page ? styles.active : ''}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
}
