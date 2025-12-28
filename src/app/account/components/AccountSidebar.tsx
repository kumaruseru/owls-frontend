'use client';

import { User as UserIcon, ShoppingBag, Lock, LogOut, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuthStore, type User } from '@/store/auth-store';

interface AccountSidebarProps {
    activeTab: 'profile' | 'password' | 'orders';
    setActiveTab: (tab: 'profile' | 'password' | 'orders') => void;
    user: User | null;
}

export function AccountSidebar({ activeTab, setActiveTab, user }: AccountSidebarProps) {
    const router = useRouter();
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl h-[400px] animate-pulse">
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl sticky top-32 transition-all hover:bg-white/[0.07]">
            {/* User Info */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                <div className="relative group cursor-pointer flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-inner">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.full_name || 'User'} className="w-full h-full object-cover" />
                        ) : (
                            <span>{(user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}</span>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <Camera size={16} className="text-white" />
                    </div>
                </div>
                <div className="overflow-hidden min-w-0">
                    <p className="font-bold text-white truncate text-lg">{user.full_name || 'User'}</p>
                    <p className="text-xs text-neutral-400 truncate font-mono">{user.email}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group",
                        activeTab === 'profile'
                            ? "bg-white/10 text-white shadow-lg shadow-purple-900/10 border border-white/5"
                            : "text-neutral-400 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <UserIcon size={18} className={cn("transition-colors", activeTab === 'profile' ? "text-purple-400" : "text-neutral-500 group-hover:text-white")} />
                    Thông tin cá nhân
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group",
                        activeTab === 'orders'
                            ? "bg-white/10 text-white shadow-lg shadow-purple-900/10 border border-white/5"
                            : "text-neutral-400 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <ShoppingBag size={18} className={cn("transition-colors", activeTab === 'orders' ? "text-purple-400" : "text-neutral-500 group-hover:text-white")} />
                    Lịch sử đơn hàng
                </button>
                <button
                    onClick={() => setActiveTab('password')}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group",
                        activeTab === 'password'
                            ? "bg-white/10 text-white shadow-lg shadow-purple-900/10 border border-white/5"
                            : "text-neutral-400 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <Lock size={18} className={cn("transition-colors", activeTab === 'password' ? "text-purple-400" : "text-neutral-500 group-hover:text-white")} />
                    Bảo mật
                </button>

                <div className="pt-4 mt-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 group"
                    >
                        <LogOut size={18} className="text-red-500 group-hover:text-red-400 transition-colors" />
                        Đăng xuất
                    </button>
                </div>
            </nav>
        </div>
    );
}
