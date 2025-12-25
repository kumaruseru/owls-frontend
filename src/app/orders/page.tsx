'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Loader2, ArrowRight, Clock, CheckCircle2, Truck, XCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';

interface Order {
    id: string;
    order_number: string;
    status: string;
    status_display: string;
    total: number;
    item_count: number;
    payment_status: string;
    created_at: string;
}

const statusConfig: Record<string, { color: string; icon: any; bgColor: string }> = {
    pending: { color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/20', icon: Clock },
    confirmed: { color: 'text-blue-400', bgColor: 'bg-blue-400/10 border-blue-400/20', icon: CheckCircle2 },
    processing: { color: 'text-purple-400', bgColor: 'bg-purple-400/10 border-purple-400/20', icon: Loader2 },
    shipping: { color: 'text-indigo-400', bgColor: 'bg-indigo-400/10 border-indigo-400/20', icon: Truck },
    delivered: { color: 'text-green-400', bgColor: 'bg-green-400/10 border-green-400/20', icon: CheckCircle2 },
    cancelled: { color: 'text-red-400', bgColor: 'bg-red-400/10 border-red-400/20', icon: XCircle },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/orders');
            return;
        }
        fetchOrders();
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/');
            setOrders(response.data.results || response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Unable to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Loading State
    if (isLoading) {
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

            {/* Content */}
            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-4xl">

                    {/* Header */}
                    <div className="mb-10 border-b border-white/10 pb-6">
                        <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-white mb-2">
                            Order History
                        </h1>
                        <p className="text-neutral-400">Track and manage your recent purchases.</p>
                    </div>

                    {/* Empty State */}
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 py-24 text-center backdrop-blur-xl">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                <ShoppingBag size={32} className="text-neutral-400" />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-white mb-2">No orders yet</h2>
                            <p className="text-neutral-400 mb-8 max-w-sm leading-relaxed">
                                Looks like you haven't made any purchases yet.<br />
                                Explore our collection to find something you love.
                            </p>
                            <Button asChild size="xl" className="rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider">
                                <Link href="/products">
                                    Start Shopping <ArrowRight size={18} className="ml-2" />
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const StatusIcon = statusConfig[order.status]?.icon || AlertCircle;
                                const statusStyle = statusConfig[order.status] || { color: 'text-gray-400', bgColor: 'bg-gray-400/10 border-gray-400/20' };
                                const isProcessing = statusStyle.icon === Loader2;

                                return (
                                    <Link
                                        key={order.id}
                                        href={`/orders/${order.order_number}`}
                                        className="group block relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-purple-500/30 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-purple-500/5 backdrop-blur-sm"
                                    >
                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

                                                {/* Left: Order Info */}
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                                        <span className="font-mono text-lg font-bold text-white tracking-wider group-hover:text-purple-400 transition-colors">
                                                            #{order.order_number}
                                                        </span>
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5",
                                                            statusStyle.color,
                                                            statusStyle.bgColor,
                                                            isProcessing && "animate-pulse"
                                                        )}>
                                                            <StatusIcon size={12} className={cn(isProcessing && "animate-spin")} />
                                                            {order.status_display}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-400">
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock size={14} /> {formatDate(order.created_at)}
                                                        </span>
                                                        <span className="hidden sm:inline w-1 h-1 bg-neutral-600 rounded-full"></span>
                                                        <span>{order.item_count} {order.item_count > 1 ? 'items' : 'item'}</span>
                                                    </div>
                                                </div>

                                                {/* Right: Total & Arrow */}
                                                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                                                    <div className="text-left md:text-right">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-0.5">Total</p>
                                                        <p className="text-xl font-mono font-bold text-white">{formatPrice(order.total)}</p>
                                                    </div>

                                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                                        <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <div className="absolute -inset-px bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 rounded-2xl" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}