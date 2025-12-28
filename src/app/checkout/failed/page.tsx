'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCcw, Home, Loader2, CreditCard } from 'lucide-react';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Button } from '@/components/ui/button';

function FailedContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason') || 'Đã xảy ra lỗi trong quá trình thanh toán';
    const orderNumber = searchParams.get('order_number');

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Fixed Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full"><></></AuroraBackground>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 py-20">
                <div className="max-w-lg w-full text-center">
                    {/* Error Animation */}
                    <div className="relative mb-8">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30">
                            <XCircle size={48} className="text-white" />
                        </div>
                        <div className="absolute inset-0 w-24 h-24 mx-auto bg-red-500 rounded-full animate-ping opacity-20" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 tracking-tight">
                        Thanh toán thất bại
                    </h1>
                    <p className="text-neutral-400 mb-4 leading-relaxed">
                        Rất tiếc, giao dịch của bạn không thể hoàn tất.
                    </p>

                    {/* Error Details Card */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 backdrop-blur-xl text-left">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <CreditCard className="text-red-400" size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-red-400/70 uppercase font-bold tracking-widest mb-1">Lý do</p>
                                <p className="text-white text-sm leading-relaxed">{reason}</p>
                            </div>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-xl text-left">
                        <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-4">Bạn có thể thử</p>
                        <ul className="space-y-3 text-sm text-neutral-300">
                            <li className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-neutral-400">1</span>
                                Kiểm tra lại thông tin thanh toán
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-neutral-400">2</span>
                                Chọn phương thức thanh toán khác
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-neutral-400">3</span>
                                Liên hệ ngân hàng/ví điện tử nếu bị trừ tiền
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button asChild size="lg" className="flex-1 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider">
                            <Link href="/checkout">
                                <RefreshCcw className="mr-2 h-4 w-4" /> Thử lại
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="flex-1 rounded-xl border-white/20 text-white hover:bg-white/5 font-bold uppercase tracking-wider">
                            <Link href="/cart">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Về giỏ hàng
                            </Link>
                        </Button>
                    </div>

                    {/* Home Link */}
                    <Link href="/" className="inline-flex items-center gap-2 mt-6 text-sm text-neutral-500 hover:text-white transition-colors">
                        <Home size={16} /> Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutFailedPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-purple-500" />
            </div>
        }>
            <FailedContent />
        </Suspense>
    );
}
