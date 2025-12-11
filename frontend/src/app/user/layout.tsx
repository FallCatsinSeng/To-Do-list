'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import UserSidebar from '@/components/UserSidebar';
import './user.css';

export default function UserLayout({
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
            } else if (isAdmin()) {
                router.push('/admin/dashboard');
            }
        }
    }, [mounted, isAuthenticated, isAdmin, router]);

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return null;
    }

    if (!isAuthenticated() || isAdmin()) {
        return null;
    }

    return (
        <div className="user-layout">
            <UserSidebar />
            <div className="user-content">{children}</div>
        </div>
    );
}

