'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
    const router = useRouter();
    const { isAuthenticated, isAdmin } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated()) {
            // Redirect based on role
            if (isAdmin()) {
                router.push('/admin/dashboard');
            } else {
                router.push('/user/dashboard');
            }
        } else {
            router.push('/login');
        }
    }, []);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>
            <p>Loading...</p>
        </div>
    );
}
