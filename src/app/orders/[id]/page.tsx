'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, Loader2, MapPin, CreditCard, Receipt, AlertTriangle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';

interface OrderItem {
    id: number;
    product_name: string;
    product_image: string | null;
    quantity: number;
    price: number;
    subtotal: number;
}

interface Order {
    id: string;
    order_number: string;
    status: string;
    status_display: string;
    payment_status: string;
    payment_method: string;
    payment_method_display: string;
    items: OrderItem[];
    subtotal: number;
    shipping_fee: number;
    discount: number;
    total: number;
    recipient_name: string;
    phone: string;
    full_address: string;
    note: string;
    created_at: string;
    can_cancel: boolean;
}

const statusSteps = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipping', label: 'Shipping', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const orderId = params.id as string;
    const isSuccess = searchParams.get('success') === 'true';
    const isPaymentSuccess = searchParams.get('payment') === 'success';

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
        if (isSuccess) {
            toast.success('Order placed successfully!');
        }
        if (isPaymentSuccess) {
            toast.success('Payment completed successfully!');
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/orders/${orderId}/`);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
            toast.error('Order not found');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        setIsCancelling(true);
        try {
            await api.post(`/orders/${orderId}/cancel/`);
            toast.success('Order cancelled');
            fetchOrder();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to cancel order');
        } finally {
            setIsCancelling(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusIndex = () => {
        if (!order) return -1;
        return statusSteps.findIndex(s => s.key === order.status);
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-purple-500" />
            </div>
        );
    }

    // Not Found State
    if (!order) {
        return (
            <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <AuroraBackground className="h-full w-full"><></></AuroraBackground>
                </div>
                <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4">
                    <div className="p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center max-w-md w-full shadow-2xl">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <AlertTriangle size={32} className="text-red-400" />
                        </div>
                        <h1 className="text-3xl font-display font-bold mb-3 text-white">Order not found</h1>
                        <p className="text-neutral-400 mb-8">The order you're looking for doesn't exist or has been removed.</p>
                        <Button asChild size="xl" className="w-full rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider">
                            <Link href="/orders">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
                            </Link>
                        </Button>
                    </div>
                </div>
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
                <div className="container mx-auto max-w-5xl">

                    {/* Back Link */}
                    <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors mb-8 group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Orders
                    </Link>

                    {/* Success Banner */}
                    {isSuccess && (
                        <div className="mb-8 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <CheckCircle className="text-green-400" size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-green-400">Order Placed Successfully!</p>
                                <p className="text-sm text-green-400/70">Thank you for your purchase. We'll send you updates via email.</p>
                            </div>
                        </div>
                    )}

                    {/* Order Header Card */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 backdrop-blur-xl">
                        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                                        Order #{order.order_number}
                                    </h1>
                                    {order.status === 'delivered' && (
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                                            Complete
                                        </span>
                                    )}
                                </div>
                                <p className="text-neutral-400 text-sm font-mono flex items-center gap-2">
                                    <Clock size={14} /> {formatDate(order.created_at)}
                                </p>
                            </div>

                            {order.can_cancel && (
                                <Button
                                    onClick={handleCancelOrder}
                                    variant="outline"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 self-start"
                                    disabled={isCancelling}
                                >
                                    {isCancelling ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                                    Cancel Order
                                </Button>
                            )}
                        </div>

                        {/* Status Timeline */}
                        {order.status !== 'cancelled' ? (
                            <div className="relative flex justify-between items-center w-full mt-10 mb-4 px-2 md:px-10">
                                {/* Progress Bar Background */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full -z-10" />

                                {/* Active Progress Bar */}
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-600 to-blue-500 -translate-y-1/2 rounded-full -z-10 transition-all duration-500"
                                    style={{ width: `${(Math.max(0, getStatusIndex()) / (statusSteps.length - 1)) * 100}%` }}
                                />

                                {statusSteps.map((step, index) => {
                                    const isActive = index <= getStatusIndex();
                                    const isCurrent = index === getStatusIndex();

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
                        ) : (
                            <div className="flex items-center justify-center gap-3 py-6 bg-red-500/10 rounded-2xl border border-red-500/20">
                                <XCircle className="text-red-500" size={24} />
                                <span className="font-bold text-red-400 uppercase tracking-widest">Order Cancelled</span>
                            </div>
                        )}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Order Items */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <Package className="text-purple-400" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Order Items</h2>
                                        <p className="text-xs text-neutral-500">{order.items.length} {order.items.length > 1 ? 'products' : 'product'}</p>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-5 pb-5 border-b border-white/5 last:border-0 last:pb-0 group">
                                            <div className="w-20 h-20 bg-white/5 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 relative">
                                                {item.product_image ? (
                                                    <Image
                                                        src={item.product_image}
                                                        alt={item.product_name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-700 text-xs">No img</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h3 className="font-bold text-white truncate mb-1">{item.product_name}</h3>
                                                <div className="text-sm text-neutral-400 flex items-center gap-4">
                                                    <span>Qty: <span className="text-white font-medium">{item.quantity}</span></span>
                                                    <span>@ {formatPrice(item.price)}</span>
                                                </div>
                                            </div>
                                            <div className="text-right self-center">
                                                <p className="font-mono font-bold text-lg text-white">{formatPrice(item.subtotal)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Info Sidebar */}
                        <div className="space-y-6">
                            {/* Summary */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <Receipt className="text-blue-400" size={20} />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">Summary</h2>
                                </div>

                                <div className="space-y-3 text-sm border-b border-white/10 pb-6 mb-6">
                                    <div className="flex justify-between text-neutral-400">
                                        <span>Subtotal</span>
                                        <span className="text-white font-mono">{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-400">
                                        <span>Shipping</span>
                                        <span className="text-white font-mono">{order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : 'Free'}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Discount</span>
                                            <span className="font-mono">-{formatPrice(order.discount)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Total</span>
                                    <span className="text-2xl font-mono font-bold text-purple-400">{formatPrice(order.total)}</span>
                                </div>

                                <div className="pt-6 border-t border-white/10 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-neutral-500">Payment</span>
                                        <span className="text-white font-medium">{order.payment_method_display}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-neutral-500">Status</span>
                                        <span className={cn(
                                            "font-bold uppercase tracking-wider text-[10px] px-2.5 py-1 rounded-full border",
                                            order.payment_status === 'paid'
                                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                        )}>
                                            {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Info */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                                        <MapPin className="text-pink-400" size={20} />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">Shipping</h2>
                                </div>
                                <div className="space-y-4 text-sm text-neutral-400">
                                    <div>
                                        <p className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest mb-1">Recipient</p>
                                        <p className="text-white font-medium">{order.recipient_name}</p>
                                        <p>{order.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest mb-1">Address</p>
                                        <p className="text-white leading-relaxed">{order.full_address}</p>
                                    </div>
                                    {order.note && (
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest mb-1">Note</p>
                                            <p className="text-neutral-300 italic text-xs leading-relaxed">"{order.note}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Security Badge */}
                            <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500 font-bold py-4">
                                <ShieldCheck size={14} className="text-green-500" /> Secure Transaction
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}