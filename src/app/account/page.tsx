'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

import { useAuthStore } from '@/store/auth-store';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { AccountSidebar } from './components/AccountSidebar';
import { ProfileTab } from './components/ProfileTab';
import { OrdersTab } from './components/OrdersTab';
import { SecurityTab } from './components/SecurityTab';

type Tab = 'profile' | 'password' | 'orders';

export default function AccountPage() {
    const router = useRouter();
    const { user, isAuthenticated, hasHydrated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Chào buổi sáng');
        else if (hour < 18) setGreeting('Chào buổi chiều');
        else setGreeting('Chào buổi tối');
    }, []);

    useEffect(() => {
        if (hasHydrated && !isAuthenticated) {
            router.push('/login?redirect=/account');
        }
    }, [hasHydrated, isAuthenticated, router]);

    if (!hasHydrated || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Fixed Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-6xl">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-white/10">
                        <div>
                            <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest text-xs mb-2">
                                <Sparkles size={14} />
                                <span>Thành viên thân thiết</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
                                {greeting}, {user?.last_name || 'Bạn'}!
                            </h1>
                        </div>
                        <p className="text-neutral-400 text-sm md:text-right max-w-xs">
                            Quản lý thông tin cá nhân, đơn hàng và bảo mật tài khoản của bạn tại đây.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8 items-start">
                        {/* Sidebar - Sticky on Desktop */}
                        <div className="lg:col-span-1 lg:sticky lg:top-32 z-20">
                            <AccountSidebar
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                user={user}
                            />
                        </div>

                        {/* Content Area with Transitions */}
                        <div className="lg:col-span-3 min-h-[500px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    {activeTab === 'profile' && <ProfileTab user={user} />}
                                    {activeTab === 'orders' && <OrdersTab />}
                                    {activeTab === 'password' && <SecurityTab user={user} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
