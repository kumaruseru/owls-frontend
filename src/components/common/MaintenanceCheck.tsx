"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

export function MaintenanceCheck() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                // Skip check for these paths to avoid loops
                if (pathname.startsWith('/admin') || pathname === '/login') {
                    setIsChecking(false);
                    return;
                }

                const response = await api.get('/core/config/');
                const config = response.data;

                const isMaintenance = config.maintenance_mode;
                const isAdmin = user?.is_staff;

                // If maintenance is ON and user is NOT admin
                if (isMaintenance && !isAdmin) {
                    // Auto-logout if user is currently logged in
                    if (user) {
                        try {
                            await logout();
                        } catch (e) {
                            console.error("Logout failed", e);
                        }
                    }

                    if (pathname !== '/maintenance') {
                        router.push('/maintenance');
                    }
                }
                // If maintenance is OFF (or user is admin) and user is on maintenance page
                else if (pathname === '/maintenance') {
                    router.push('/');
                }

            } catch (error) {
                console.error('Failed to check maintenance status:', error);
            } finally {
                setIsChecking(false);
            }
        };

        checkMaintenance();

        // Optional: Poll every minute or listen to websocket if available
        const interval = setInterval(checkMaintenance, 60000);
        return () => clearInterval(interval);

    }, [pathname, router, user, logout]);

    return null; // This component handles logic only, no UI
}
