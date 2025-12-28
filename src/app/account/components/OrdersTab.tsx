'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, Package, ChevronRight, Calendar, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatPrice, cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface OrderSummary {
    id: number;
    order_number: string;
    total: number;
    status: string;
    status_display: string;
    payment_status: string;
    created_at: string;
    item_count: number;
}

const StatusBadge = ({ status, label }: { status: string; label: string }) => {
    const getStyles = () => {
        const s = status?.toLowerCase();
        if (['completed', 'delivered', 'paid', 'confirmed'].includes(s)) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        if (['pending', 'processing'].includes(s)) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        if (['shipping', 'shipped'].includes(s)) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
        if (['cancelled', 'failed', 'refunded'].includes(s)) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    };

    const getIcon = () => {
        const s = status?.toLowerCase();
        if (['completed', 'delivered', 'paid', 'confirmed'].includes(s)) return <CheckCircle size={10} className="mr-1" />;
        if (['pending', 'processing'].includes(s)) return <Clock size={10} className="mr-1" />;
        if (['shipping', 'shipped'].includes(s)) return <Truck size={10} className="mr-1" />;
        if (['cancelled', 'failed', 'refunded'].includes(s)) return <XCircle size={10} className="mr-1" />;
        return null;
    };

    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider", getStyles())}>
            {getIcon()}
            {label}
        </span>
    );
};

export function OrdersTab() {
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoadingOrders(true);
            try {
                const response = await api.get('/orders/');
                setOrders(response.data.results || response.data);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
                toast.error('Không thể tải lịch sử đơn hàng');
            } finally {
                setIsLoadingOrders(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                    <ShoppingBag className="text-purple-400" size={20} />
                </div>
                Lịch sử đơn hàng
            </h2>

            {isLoadingOrders ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-purple-500" size={32} />
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 px-6 bg-black/20 rounded-2xl border border-white/5 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Package size={32} className="text-neutral-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Chưa có đơn hàng</h3>
                    <p className="text-neutral-400 font-medium mb-6">Bạn chưa mua sắm tại cửa hàng.</p>
                    <Link href="/products">
                        <Button variant="default" className="bg-white text-black hover:bg-neutral-200 rounded-xl font-bold">
                            Mua sắm ngay
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link
                            key={order.order_number}
                            href={`/orders/${order.order_number}`}
                            className="block bg-black/20 border border-white/5 rounded-2xl p-5 hover:bg-white/5 hover:border-purple-500/30 transition-all duration-300 group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-bold text-white text-lg group-hover:text-purple-400 transition-colors">
                                            #{order.order_number}
                                        </span>
                                        <span className="text-xs text-neutral-500 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                                            <Calendar size={10} />
                                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                                        <Package size={14} />
                                        <span>{order.item_count} sản phẩm</span>
                                        <span className="text-neutral-600">•</span>
                                        <span className="text-white font-bold">{formatPrice(order.total)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-4 md:pt-0 border-t border-white/5 md:border-none">
                                    <div className="flex flex-col items-start md:items-end gap-1.5">
                                        <StatusBadge status={order.status} label={order.status_display} />

                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                                        <ChevronRight className="text-neutral-500 group-hover:text-white" size={16} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
