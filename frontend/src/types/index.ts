// Type definitions for the application

export interface User {
    id: number;
    nama: string;
    email: string;
    role: 'admin' | 'user';
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
