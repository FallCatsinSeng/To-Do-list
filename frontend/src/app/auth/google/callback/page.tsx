'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function GoogleCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuth } = useAuthStore();
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const handleCallback = () => {
            try {
                // Extract data from URL params
                const token = searchParams.get('token');
                const userId = searchParams.get('userId');
                const email = searchParams.get('email');
                const nama = searchParams.get('nama');
                const role = searchParams.get('role');
                const foto = searchParams.get('foto');

                if (!token || !userId || !email || !nama || !role) {
                    setError('Invalid callback data');
                    setProcessing(false);
                    return;
                }

                // Create user object
                const user = {
                    id: parseInt(userId),
                    email: decodeURIComponent(email),
                    nama: decodeURIComponent(nama),
                    role: role as 'user' | 'admin',
                    foto: foto ? decodeURIComponent(foto) : '',
                };

                // Save to auth store
                setAuth(user, token);

                // Redirect based on role
                setTimeout(() => {
                    if (user.role === 'admin') {
                        router.push('/admin/dashboard');
                    } else {
                        router.push('/user/dashboard');
                    }
                }, 1000);
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError('Failed to process login');
                setProcessing(false);
            }
        };

        handleCallback();
    }, [searchParams, setAuth, router]);

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#eef1f5',
    };

    const cardStyle = {
        width: '400px',
        background: '#fff',
        padding: '35px',
        borderRadius: '15px',
        boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.1)',
        textAlign: 'center' as const,
    };

    if (error) {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <h2>Login Error</h2>
                    <p style={{ color: '#dc3545', marginTop: '20px' }}>{error}</p>
                    <a href="/login" style={{
                        display: 'inline-block',
                        marginTop: '20px',
                        padding: '12px 24px',
                        background: '#4e73df',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none'
                    }}>
                        Back to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2>Processing Login...</h2>
                <p style={{ marginTop: '20px' }}>
                    {processing ? 'Please wait...' : 'Redirecting...'}
                </p>
            </div>
        </div>
    );
}
