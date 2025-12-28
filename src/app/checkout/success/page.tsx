'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Home, Loader2 } from 'lucide-react';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface Order {
    id: string;
    order_number: string;
    total: number;
    status_display: string;
    payment_status: string;
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('order_number');
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAndFetchOrder = async () => {
            const vnpResponseCode = searchParams.get('vnp_ResponseCode');

            // Case 1: Returning from VNPay (Needs Verification)
            if (vnpResponseCode) {
                try {
                    // Collect all search params
                    const params: Record<string, string> = {};
                    searchParams.forEach((value, key) => {
                        params[key] = value;
                    });

                    // Verify with backend
                    const verifyRes = await api.post('/payments/vnpay/verify/', params);

                    if (verifyRes.data.success) {
                        // Verification successful, fetch fresh order data
                        const oNumber = verifyRes.data.order_number || searchParams.get('vnp_TxnRef'); // Fallback if backend doesn't return order_number in verify
                        // Wait a bit for DB propagation if needed, though verify is sync
                        const response = await api.get(`/orders/${oNumber}/`);
                        setOrder(response.data);
                    } else {
                        // Verification failed
                        window.location.href = `/checkout?payment=failed&reason=${verifyRes.data.message}`;
                        return;
                    }
                } catch (error) {
                    console.error('Verification failed:', error);
                    // Might be already verified or network error, verify by just fetching order
                    if (orderNumber) {
                        const response = await api.get(`/orders/${orderNumber}/`);
                        setOrder(response.data);
                    }
                }
            }
            // Case 2: Just viewing success page (Already Verified)
            else if (orderNumber) {
                try {
                    const response = await api.get(`/orders/${orderNumber}/`);
                    setOrder(response.data);
                } catch (error) {
                    console.error('Failed to fetch order:', error);
                }
            }

            setIsLoading(false);
        };

        verifyAndFetchOrder();
    }, [searchParams, orderNumber]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

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
                <AuroraBackground className="h-full w-full"><></></AuroraBackground>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 py-20">
                <div className="max-w-lg w-full text-center">
                    {/* Success Animation */}
                    <div className="relative mb-8">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 animate-pulse">
                            <CheckCircle size={48} className="text-white" />
                        </div>
                        <div className="absolute inset-0 w-24 h-24 mx-auto bg-green-500 rounded-full animate-ping opacity-20" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 tracking-tight">
                        Thanh toán thành công!
                    </h1>
                    <p className="text-neutral-400 mb-8 leading-relaxed">
                        Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
                    </p>

                    {/* Order Details Card */}
                    {order && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-xl text-left">
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <Package className="text-purple-400" size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Mã đơn hàng</p>
                                    <p className="text-white font-mono font-bold">{order.order_number}</p>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Trạng thái</span>
                                    <span className="text-green-400 font-medium">{order.status_display}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-400">Thanh toán</span>
                                    <span className="text-green-400 font-medium">
                                        {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-white/10">
                                    <span className="text-neutral-400 font-bold">Tổng cộng</span>
                                    <span className="text-purple-400 font-mono font-bold text-lg">{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {order && (
                            <Button asChild size="lg" className="flex-1 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider">
                                <Link href={`/orders/${order.order_number}`}>
                                    Xem đơn hàng <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        <Button asChild size="lg" variant="outline" className="flex-1 rounded-xl border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-wider">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" /> Trang chủ
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-purple-500" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
