// Type definitions for the application

export interface User {
    id: number;
    nama: string;
    email: string;
    role: 'admin' | 'user' | 'guru';
    foto?: string;
}

export interface Student {
    id: number;
    nama: string;
    nim: string;
    jurusan: string;
    created_at: string;
    updated_at: string;
}

export interface Gallery {
    id: number;
    filename: string;
    uploader: number;
    user?: User;
    created_at: string;
}

export interface Todo {
    id: number;
    user_id: number;
    title: string;
    status: 'pending' | 'done';
    created_at: string;
    user?: User;
}

export interface Comment {
    id: number;
    user_id: number;
    comment: string;
    created_at: string;
    user?: User;
}

export interface MahasiswaGuru {
    id: number;
    mahasiswa_id: number;
    guru_id: number;
    status: 'pending' | 'approved' | 'rejected';
    mahasiswa?: User;
    guru?: User;
    created_at: string;
    updated_at: string;
}

export interface Assignment {
    id: number;
    guru_id: number;
    title: string;
    description: string;
    due_date?: string;
    created_at: string;
    updated_at: string;
    guru?: User;
}

export interface AssignmentSubmission {
    id: number;
    assignment_id: number;
    mahasiswa_id: number;
    status: 'pending' | 'submitted' | 'graded';
    submitted_at?: string;
    grade?: number;
    feedback?: string;
    assignment?: Assignment;
    mahasiswa?: User;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface ApiResponse<T> {
    data?: T;
    message?: string;
    error?: string;
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
}
