'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from '@/components/AdminSidebar';
import '../admin.css';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, isAdmin } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            if (!isAuthenticated()) {
                router.push('/login');
            } else if (!isAdmin()) {
                router.push('/user/dashboard');
            }
        }
    }, [mounted, isAuthenticated, isAdmin, router]);

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return null;
    }

    if (!isAuthenticated() || !isAdmin()) {
        return null;
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">{children}</div>
        </div>
    );
}

