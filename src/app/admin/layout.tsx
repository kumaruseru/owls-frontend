"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading) {
            if (!isAuthenticated || !user?.is_staff) {
                router.push("/");
            }
        }
    }, [mounted, isLoading, isAuthenticated, user, router]);

    // Loading State
    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
        );
    }

    // Auth Check
    if (!isAuthenticated || !user?.is_staff) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Global Admin Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            {/* Main Content Area */}
            <main className="relative z-10 min-h-screen transition-all duration-300">
                <div className="w-full h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
