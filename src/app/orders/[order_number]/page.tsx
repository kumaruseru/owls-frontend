'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Package, MapPin, CreditCard, CheckCircle, Clock, Truck, XCircle, ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { formatPrice, cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface OrderItem {
    id: number;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    color: string | null;
}

interface OrderDetail {
    order_number: string;
    status: string;
    status_display: string;
    payment_status: string;
    payment_method: string;
    total: number;
    shipping_fee: number;
    subtotal: number;
    created_at: string;
    recipient_name: string;
    phone: string;
    full_address: string;
    items: OrderItem[];
}

// Reusing Status Badge for consistency
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
        <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider", getStyles())}>
            {getIcon()}
            {label}
        </span>
    );
};

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderNumber = params.order_number as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!orderNumber) return;

        const fetchOrder = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/orders/${orderNumber}/`);
                setOrder(response.data);
            } catch (error) {
                console.error('Failed to fetch order:', error);
                toast.error('Không tìm thấy đơn hàng');
                router.push('/account');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [orderNumber, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-purple-500" />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full"><></></AuroraBackground>
            </div>

            <main className="relative z-10 w-full min-h-screen pt-32 pb-20 px-4 md:px-6">
                <div className="container mx-auto max-w-4xl">

                    {/* Header / Nav */}
                    <div className="flex items-center gap-4 mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="bg-white/5 hover:bg-white/10 text-white rounded-xl h-10 w-10 p-0"
                        >
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-1">Chi tiết đơn hàng</p>
                            <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-3">
                                #{order.order_number}
                                <StatusBadge status={order.status} label={order.status_display} />
                            </h1>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    {['cancelled', 'failed', 'refunded'].includes(order.status) ? (
                        <div className="flex items-center justify-center gap-3 py-6 bg-red-500/10 rounded-2xl border border-red-500/20 mb-8">
                            <XCircle className="text-red-500" size={24} />
                            <span className="font-bold text-red-500 uppercase tracking-widest">Đơn hàng đã bị hủy</span>
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 backdrop-blur-xl">
                            <div className="relative flex justify-between items-center w-full px-2 md:px-10 py-4">
                                {/* Progress Bar Background */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full -z-10" />

                                {/* Active Progress Bar */}
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-600 to-blue-500 -translate-y-1/2 rounded-full -z-10 transition-all duration-500"
                                    style={{
                                        width: `${(Math.max(0, [
                                            'pending',
                                            'confirmed',
                                            'processing',
                                            'shipped',
                                            'delivered'
                                        ].findIndex(s => s === order.status)) / 4) * 100}%`
                                    }}
                                />

                                {[
                                    { key: 'pending', label: 'Chờ xác nhận', icon: Clock },
                                    { key: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle },
                                    { key: 'processing', label: 'Đang xử lý', icon: Package },
                                    { key: 'shipped', label: 'Đang giao', icon: Truck },
                                    { key: 'delivered', label: 'Đã giao', icon: CheckCircle },
                                ].map((step, index) => {
                                    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                                    const currentStatusIndex = statusOrder.findIndex(s => s === order.status);
                                    const stepIndex = index;

                                    const isActive = stepIndex <= currentStatusIndex;
                                    const isCurrent = stepIndex === currentStatusIndex;

                                    return (
                                        <div key={step.key} className="flex flex-col items-center gap-3 relative group">
                                            <div className={cn(
                                                "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-black",
                                                isActive
                                                    ? "border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                                    : "border-white/20 text-neutral-600",
                                                isCurrent && "scale-110"
                                            )}>
                                                <step.icon size={18} />
                                            </div>
                                            <p className={cn(
                                                "absolute -bottom-8 text-[9px] md:text-[10px] uppercase font-bold tracking-wider whitespace-nowrap transition-colors",
                                                isActive ? "text-white" : "text-neutral-600"
                                            )}>
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-8">

                        {/* Main Content: Items */}
                        <div className="md:col-span-2 space-y-6">

                            {/* Order Info Cards */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <Package size={18} className="text-purple-400" />
                                    Sản phẩm đã mua
                                </h3>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                                            <div className="w-20 h-20 rounded-xl bg-white/5 overflow-hidden flex-shrink-0 border border-white/10">
                                                {item.product_image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-600">
                                                        <ShoppingBag size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-bold text-white text-sm line-clamp-2 leading-snug mb-1">{item.product_name}</h4>
                                                    {item.color && (
                                                        <p className="text-xs text-neutral-400">Màu sắc: {item.color}</p>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-end mt-2">
                                                    <p className="text-xs text-neutral-500 font-mono bg-white/5 px-2 py-0.5 rounded">x{item.quantity}</p>
                                                    <p className="font-bold text-white text-sm">{formatPrice(item.price)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-0.5">Phương thức thanh toán</p>
                                        <p className="text-white font-bold text-sm uppercase">{order.payment_method}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-0.5">Trạng thái</p>
                                    <span className={cn(
                                        "font-bold text-sm uppercase",
                                        order.payment_status === 'paid' ? "text-emerald-400" : "text-amber-400"
                                    )}>
                                        {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Sidebar: Summary & Address */}
                        <div className="md:col-span-1 space-y-6">

                            {/* Summary */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                                <h3 className="font-bold text-white mb-6 border-b border-white/10 pb-4">Tổng quan đơn hàng</h3>
                                <div className="space-y-3 text-sm mb-6">
                                    <div className="flex justify-between text-neutral-400">
                                        <span>Ngày đặt</span>
                                        <span className="font-mono text-white">{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-400">
                                        <span>Tạm tính</span>
                                        <span className="font-mono text-white">{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-400">
                                        <span>Phí vận chuyển</span>
                                        <span className="font-mono text-white">{formatPrice(order.shipping_fee || 0)}</span>
                                    </div>
                                    <div className="border-t border-white/10 my-2 pt-2 flex justify-between items-baseline">
                                        <span className="font-bold text-white">Tổng cộng</span>
                                        <span className="font-bold text-xl text-purple-400 font-display">{formatPrice(order.total)}</span>
                                    </div>
                                </div>

                                {/* Could add action buttons here later like Reorder or Cancel */}
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <MapPin size={18} className="text-purple-400" />
                                    Địa chỉ nhận hàng
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="font-bold text-white text-base">{order.recipient_name}</p>
                                    <p className="text-neutral-400 font-mono text-xs">{order.phone}</p>
                                    <p className="text-neutral-300 leading-relaxed pt-2 border-t border-white/5 mt-2">
                                        {order.full_address}
                                    </p>
                                </div>
                            </div>

                            {/* Support */}
                            <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-5 text-center">
                                <p className="text-xs text-purple-300 mb-2">Cần hỗ trợ đơn hàng này?</p>
                                <Button variant="link" className="text-purple-400 font-bold p-0 h-auto text-sm">
                                    Liên hệ CSKH &rarr;
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
