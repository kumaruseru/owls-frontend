'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion } from 'framer-motion';

const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordForm) => {
        setIsSubmitting(true);
        try {
            await api.post('/auth/password-reset/', data);
            // Always show success to prevent email enumeration (though backend handles this logic too)
            setIsSent(true);
            toast.success('Đường dẫn đặt lại mật khẩu đã được gửi đến email của bạn.');
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-black text-white font-sans selection:bg-purple-500/30 overflow-hidden flex items-center justify-center p-4">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            {/* Back Button */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="fixed top-8 left-8 z-50"
            >
                <Button
                    asChild
                    variant="ghost"
                    className="group text-white/50 hover:text-white hover:bg-white/5 rounded-full px-4 border border-transparent hover:border-white/10 transition-all duration-300"
                >
                    <Link href="/login" className="flex items-center gap-2">
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        <span className="font-medium">Quay lại đăng nhập</span>
                    </Link>
                </Button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[420px] relative z-10"
            >
                <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl p-8 text-center transition-all duration-500 hover:border-white/20 hover:shadow-purple-500/10">

                    {/* Ambient Glow */}
                    <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl opacity-50" />

                    {!isSent ? (
                        <>
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-500">
                                <KeyRound className="text-purple-300" size={28} />
                            </div>

                            <h1 className="text-2xl font-bold text-white mb-2">Quên mật khẩu?</h1>
                            <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
                                Đừng lo lắng. Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                            </p>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2 text-left">
                                    <div className="relative group/input">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within/input:text-purple-400" size={18} />
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            {...register('email')}
                                            className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all duration-300"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-400 text-xs ml-1 font-medium animate-in slide-in-from-top-1">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-12 rounded-xl bg-white text-black font-bold text-base hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2" size={18} />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        "Gửi hướng dẫn"
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <Mail className="text-emerald-400" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Kiểm tra email của bạn</h2>
                            <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
                                Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra cả hộp thư rác.
                            </p>

                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="outline"
                                    className="w-full h-11 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"
                                    onClick={() => window.open('https://gmail.com', '_blank')}
                                >
                                    Mở Email
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full text-neutral-500 hover:text-white"
                                    onClick={() => setIsSent(false)}
                                >
                                    Gửi lại email
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
