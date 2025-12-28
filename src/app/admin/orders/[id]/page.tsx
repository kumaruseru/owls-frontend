"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    CreditCard,
    Package,
    CheckCircle,
    XCircle,
    Truck,
    Box,
    Loader2,
    Calendar,
    User
} from "lucide-react";
import toast from "react-hot-toast";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import React from "react";

interface OrderDetail {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    payment_method_display: string;
    recipient_name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    note: string;
    subtotal: number;
    shipping_fee: number;
    discount: number;
    total: number;
    created_at: string;
    items: Array<{
        id: number;
        product_name: string;
        product_image: string;
        quantity: number;
        price: number;
        subtotal: number;
    }>;
}

// Helper component for badges to match Aurora style
const StatusBadge = ({ status, type = 'order' }: { status: string; type?: 'order' | 'payment' }) => {
    const getStyles = () => {
        const s = status?.toLowerCase();
        if (['completed', 'delivered', 'paid', 'confirmed'].includes(s)) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        if (['pending', 'processing'].includes(s)) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        if (['shipping'].includes(s)) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
        if (['cancelled', 'failed', 'refunded'].includes(s)) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    };

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider", getStyles())}>
            {status}
        </span>
    );
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = React.use(params);
    const orderId = resolvedParams.id;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrder(orderId);
        }
    }, [orderId]);

    const fetchOrder = async (id: string) => {
        try {
            const { data } = await api.get(`/admin/orders/${id}/`);
            setOrder(data);
        } catch (error) {
            console.error("Fetch order error:", error);
            toast.error("Could not fetch order details");
            router.push("/admin/orders");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!order) return;
        setUpdating(true);
        try {
            // Use the status endpoint which triggers OrderService.update_order_status()
            // This will send confirmation email and create GHN shipping order for COD
            await api.post(`/admin/orders/${order.order_number}/status/`, {
                status: newStatus
            });
            toast.success(`Order updated to ${newStatus}`);
            fetchOrder(order.order_number);
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.error || "Failed to update status";
            toast.error(errorMsg);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Fixed Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-7xl">

                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/admin/orders"
                            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Orders
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
                                        #{order.order_number}
                                    </h1>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div className="flex items-center gap-4 text-zinc-400 text-sm">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(order.created_at)}
                                    </span>
                                    <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                    <span>{order.items.length} items</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Main Content: Order Items */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl shadow-purple-900/5">
                                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                                        <Package className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <h2 className="font-bold text-lg text-white">Order Items</h2>
                                </div>

                                <div className="divide-y divide-white/5">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="p-6 flex items-center gap-6 hover:bg-white/[0.02] transition-colors">
                                            <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 relative group">
                                                {item.product_image ? (
                                                    <img
                                                        src={item.product_image}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                                        <Package className="text-zinc-700" size={24} />
                                                    </div>
                                                )}
                                                <div className="absolute top-0 right-0 bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white rounded-bl-lg backdrop-blur-sm">
                                                    x{item.quantity}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white text-lg truncate mb-1">{item.product_name}</h3>
                                                <p className="text-sm text-zinc-400 font-mono">ID: {item.id}</p>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-bold text-white text-lg">{formatPrice(item.subtotal)}</p>
                                                <p className="text-xs text-zinc-500">{formatPrice(item.price)} each</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 bg-black/20 border-t border-white/10 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Subtotal</span>
                                        <span className="text-white font-medium">{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Shipping Fee</span>
                                        <span className="text-white font-medium">{formatPrice(order.shipping_fee)}</span>
                                    </div>
                                    {Number(order.discount) > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-400">Discount</span>
                                            <span className="text-rose-400 font-medium">-{formatPrice(order.discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end pt-4 border-t border-white/10 mt-4">
                                        <span className="text-white font-bold">Total Amount</span>
                                        <span className="text-3xl font-display font-bold text-white">{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">

                            {/* Actions Card */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                                <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest text-zinc-500">Order Actions</h3>
                                <div className="space-y-3">
                                    {order.status === 'pending' && (
                                        <>
                                            {order.payment_status === 'paid' ? (
                                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                                                    <p className="text-emerald-400 font-bold mb-1">Order Paid</p>
                                                    <p className="text-zinc-400 text-xs">Waiting for auto-confirmation or system processing.</p>
                                                    <Button
                                                        onClick={() => updateStatus('confirmed')}
                                                        disabled={updating}
                                                        variant="ghost"
                                                        className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 h-auto py-1"
                                                    >
                                                        Force Confirm
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={() => updateStatus('confirmed')}
                                                    disabled={updating}
                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-bold"
                                                >
                                                    {updating ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                                    Confirm Order
                                                </Button>
                                            )}

                                            <Button
                                                onClick={() => updateStatus('cancelled')}
                                                disabled={updating}
                                                variant="outline"
                                                className="w-full border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl h-12 bg-transparent mt-2"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Cancel Order
                                            </Button>
                                        </>
                                    )}
                                    {/* Unified Shipping/Delivery Step */}
                                    {(order.status === 'confirmed' || order.status === 'shipping') && (
                                        <div className="space-y-3">
                                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                                        <Truck className="w-4 h-4 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-blue-400 font-bold text-sm">Shipping in Progress</p>
                                                        <p className="text-zinc-400 text-xs">Handled by GHN</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => updateStatus('delivered')}
                                                disabled={updating}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 font-bold"
                                            >
                                                {updating ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Box className="w-4 h-4 mr-2" />}
                                                Mark Delivered
                                            </Button>
                                        </div>
                                    )}
                                    {['delivered', 'cancelled', 'refunded'].includes(order.status) && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                                            <p className="text-zinc-500 text-sm">No further actions available.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-400" />
                                    Customer Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg text-zinc-400">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Recipient</p>
                                            <p className="text-white font-medium">{order.recipient_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg text-zinc-400">
                                            <Phone size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Phone</p>
                                            <p className="text-white font-medium">{order.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg text-zinc-400">
                                            <Mail size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email</p>
                                            <p className="text-white font-medium truncate max-w-[200px]">{order.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-cyan-400" />
                                    Delivery Address
                                </h3>
                                <div className="p-4 bg-black/20 rounded-xl border border-white/5 text-sm leading-relaxed text-zinc-300">
                                    {order.address}<br />
                                    {order.ward}, {order.district}<br />
                                    {order.city}
                                </div>
                                {order.note && (
                                    <div className="mt-4">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Note</p>
                                        <p className="text-sm text-zinc-300 italic">"{order.note}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Info */}
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-yellow-400" />
                                    Payment Information
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-sm text-zinc-400">Method</span>
                                        <span className="font-medium text-white capitalize">{order.payment_method_display || order.payment_method}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-sm text-zinc-400">Status</span>
                                        <StatusBadge status={order.payment_status} type="payment" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
