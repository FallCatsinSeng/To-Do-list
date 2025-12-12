'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import GuruSidebar from '@/components/GuruSidebar';
import './guru.css';

export default function GuruLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            if (!isAuthenticated()) {
                router.push('/login');
            } else if (user?.role !== 'guru') {
                // Redirect non-guru users
                if (user?.role === 'admin') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/user/dashboard');
                }
            }
        }
    }, [mounted, isAuthenticated, user, router]);

    // Prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    if (!isAuthenticated() || user?.role !== 'guru') {
        return null;
    }

    return (
        <div className="guru-layout">
            <GuruSidebar />
            <div className="guru-content">{children}</div>
        </div>
    );
}
