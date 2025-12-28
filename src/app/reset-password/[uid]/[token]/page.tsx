'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ArrowLeft, Loader2, Check, ShieldCheck, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, use } from 'react';
import api from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Schema
const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/\d/, 'Phải chứa ít nhất một số')
        .regex(/[A-Z]/, 'Phải chứa ít nhất một chữ hoa')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Phải chứa ít nhất một ký tự đặc biệt'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage({ params }: { params: Promise<{ uid: string; token: string }> }) {
    const { uid, token } = use(params);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordForm) => {
        setIsSubmitting(true);
        try {
            await api.post(`/auth/password-reset-confirm/${uid}/${token}/`, {
                password: data.password
            });
            toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
            router.push('/login');
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error || 'Liên kết không hợp lệ hoặc đã hết hạn.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const password = watch('password') || '';

    // Password requirements tracker
    const requirements = [
        { text: "Ít nhất 8 ký tự", met: password.length >= 8 },
        { text: "Chứa số", met: /\d/.test(password) },
        { text: "Chứa chữ hoa", met: /[A-Z]/.test(password) },
        { text: "Chứa ký tự đặc biệt", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    return (
        <div className="relative min-h-screen w-full bg-black text-white font-sans selection:bg-purple-500/30 overflow-hidden flex items-center justify-center p-4">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[420px] relative z-10"
            >
                <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl p-8 transition-all duration-500 hover:border-white/20 hover:shadow-purple-500/10">

                    {/* Ambient Glow */}
                    <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl opacity-50" />

                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-500">
                        <ShieldCheck className="text-blue-300" size={28} />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">Đặt lại mật khẩu</h1>
                    <p className="text-neutral-400 text-sm mb-8">
                        Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* New Password */}
                        <div className="space-y-2">
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within/input:text-purple-400" size={18} />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mật khẩu mới"
                                    {...register('password')}
                                    className="h-12 pl-12 pr-10 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Requirements List */}
                        <div className="grid grid-cols-2 gap-2">
                            {requirements.map((req, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px] transition-colors duration-300">
                                    <div className={cn(
                                        "w-3 h-3 rounded-full flex items-center justify-center transition-all duration-300 border",
                                        req.met ? "bg-emerald-500 border-emerald-500" : "bg-white/5 border-white/10"
                                    )}>
                                        {req.met && <Check size={8} className="text-white" />}
                                    </div>
                                    <span className={cn(req.met ? "text-neutral-300" : "text-neutral-500")}>
                                        {req.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within/input:text-purple-400" size={18} />
                                <Input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Xác nhận mật khẩu mới"
                                    {...register('confirmPassword')}
                                    className="h-12 pl-12 pr-10 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-1"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-400 text-xs ml-1 flex items-center gap-1 font-medium animate-in slide-in-from-top-1">
                                    <AlertTriangle size={12} />
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full h-12 rounded-xl bg-white text-black font-bold text-base hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] mt-4"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Đặt lại mật khẩu"
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-xs text-neutral-500">
                        <Link href="/login" className="hover:text-white transition-colors">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
