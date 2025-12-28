'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Github, Chrome, AlertCircle, Shield, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
    email: z.string().email('Invalid Email'),
    password: z.string().min(1, 'Password required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2FA State
    const [step, setStep] = useState<'login' | '2fa'>('login');
    const [tempToken, setTempToken] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [method, setMethod] = useState<'totp' | 'email' | 'backup'>('totp');
    const [emailCooldown, setEmailCooldown] = useState(0);
    const otpInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    // Auto-focus OTP input when entering 2FA step
    useEffect(() => {
        if (step === '2fa') {
            setTimeout(() => otpInputRef.current?.focus(), 100);
        }
    }, [step]);

    // Email Cooldown Timer
    useEffect(() => {
        if (emailCooldown > 0) {
            const timer = setInterval(() => setEmailCooldown(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [emailCooldown]);

    const onSubmit = async (data: LoginForm) => {
        setIsSubmitting(true);
        try {
            const res = await login(data.email, data.password);

            if (res?.requires_2fa) {
                setTempToken(res.temp_token);
                setStep('2fa');
                // Check if user has preferences? For now default to TOTP
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-center bg-black/80 border border-purple-500/50 backdrop-blur-md text-white rounded-xl p-4 shadow-xl`}>
                        <Shield className="w-5 h-5 text-purple-400 mr-3" />
                        <div>
                            <p className="font-bold text-sm">2FA Required</p>
                            <p className="text-xs text-neutral-400">Please enter your verification code.</p>
                        </div>
                    </div>
                ));
                return;
            }

            toast.success('Welcome back.');
            router.push('/');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendEmail = async () => {
        if (emailCooldown > 0) return;

        try {
            await useAuthStore.getState().send2FAEmail(tempToken);
            setEmailCooldown(60);
            toast.success("Verification code sent to your email.");
        } catch (error) {
            toast.error("Failed to send email. Please try again.");
        }
    };

    const onVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otpCode.length !== 6) return;

        setIsSubmitting(true);
        try {
            // Check if backup code
            const isBackup = method === 'backup';
            await useAuthStore.getState().verify2FA(tempToken, otpCode, isBackup);

            toast.success('Verified successfully.');
            router.push('/');
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as any).response === 'object' && (error as any).response !== null && 'data' in (error as any).response) {
                const errorData = (error as any).response.data;
                toast.error(errorData.detail || errorData.error || 'Verification failed');
            } else if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('An unexpected error occurred');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-black text-white font-sans selection:bg-purple-500/30 overflow-hidden">
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
                    <Link href="/" className="flex items-center gap-2">
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        <span className="font-medium">Back to Store</span>
                    </Link>
                </Button>
            </motion.div>

            <div className="relative z-10 min-h-screen w-full flex items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    {step === 'login' ? (
                        <motion.div
                            key="login-form"
                            initial={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.95, y: -20, filter: "blur(10px)", transition: { duration: 0.2 } }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full max-w-[420px]"
                        >
                            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-white/20 hover:shadow-purple-500/10">

                                {/* Ambient Glow */}
                                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
                                <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

                                {/* Header */}
                                <div className="p-8 pb-4 text-center relative z-10">
                                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-lg mb-6 group-hover:scale-105 transition-transform duration-500">
                                        <Lock className="text-purple-300" size={24} />
                                    </div>
                                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back</h1>
                                    <p className="text-neutral-400 text-sm leading-relaxed max-w-[280px] mx-auto">
                                        Enter your credentials to access your secure account.
                                    </p>
                                </div>

                                {/* Form */}
                                <div className="p-8 relative z-10">
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                                        {/* Email Field */}
                                        <div className="space-y-1.5">
                                            <div className="relative group/input">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within/input:text-purple-400" size={18} />
                                                <Input
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    {...register('email')}
                                                    className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all duration-300"
                                                />
                                            </div>
                                            <AnimatePresence>
                                                {errors.email && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="flex items-center gap-2 text-red-400 text-xs ml-1 font-medium overflow-hidden"
                                                    >
                                                        <AlertCircle size={12} />
                                                        <span>{errors.email.message}</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-1.5">
                                            <div className="relative group/input">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within/input:text-purple-400" size={18} />
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
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
                                            <div className="flex justify-end mt-1">
                                                <Link href="/forgot-password" className="text-xs text-neutral-500 hover:text-purple-400 transition-colors font-medium">Forgot password?</Link>
                                            </div>
                                            <AnimatePresence>
                                                {errors.password && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="flex items-center gap-2 text-red-400 text-xs ml-1 font-medium overflow-hidden"
                                                    >
                                                        <AlertCircle size={12} />
                                                        <span>{errors.password.message}</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full h-12 rounded-xl bg-white text-black font-bold text-base hover:bg-neutral-200 transition-all duration-300 mt-2 relative overflow-hidden group/btn"
                                            disabled={isSubmitting}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="animate-spin h-5 w-5" />
                                                        <span>Verifying...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Sign In</span>
                                                        <ChevronRight size={18} className="opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                                                    </>
                                                )}
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                        </Button>
                                    </form>

                                    {/* Divider */}
                                    <div className="relative my-8">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/5"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase font-medium tracking-wider">
                                            <span className="bg-[#050505] px-3 text-neutral-600">Or continue with</span>
                                        </div>
                                    </div>

                                    {/* Social Login */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            variant="outline"
                                            className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-neutral-300 gap-2 transition-all"
                                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/social/google/`}
                                        >
                                            <Chrome size={18} />
                                            Google
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-neutral-300 gap-2 transition-all"
                                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/social/github/`}
                                        >
                                            <Github size={18} />
                                            Github
                                        </Button>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-8 text-center text-sm text-neutral-500">
                                        Don&apos;t have an account? <Link href="/register" className="text-white font-bold hover:text-purple-400 transition-colors ml-1">Sign Up</Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="2fa-form"
                            initial={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.95, y: -20, filter: "blur(10px)", transition: { duration: 0.2 } }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full max-w-[420px]"
                        >
                            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl p-8 text-center">

                                {/* Ambient Glow */}
                                <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl opacity-50" />

                                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-pulse">
                                    <Shield size={32} />
                                </div>
                                <h1 className="text-2xl font-bold mb-2">Security Check</h1>
                                <p className="text-neutral-400 text-sm mb-6 mx-auto max-w-[300px]">
                                    {method === 'totp' && "Enter the 6-digit code from your authenticator app."}
                                    {method === 'email' && "Enter the 6-digit code sent to your email."}
                                    {method === 'backup' && "Enter one of your 6-digit backup codes."}
                                </p>

                                {/* Method Switcher */}
                                <div className="flex justify-center gap-2 mb-8">
                                    <button
                                        onClick={() => setMethod('totp')}
                                        className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", method === 'totp' ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white")}
                                    >
                                        Authenticator
                                    </button>
                                    <button
                                        onClick={() => setMethod('email')}
                                        className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", method === 'email' ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white")}
                                    >
                                        Email OTP
                                    </button>
                                    <button
                                        onClick={() => setMethod('backup')}
                                        className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", method === 'backup' ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white")}
                                    >
                                        Backup Code
                                    </button>
                                </div>

                                <form onSubmit={onVerify2FA} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Input
                                                ref={otpInputRef}
                                                value={otpCode}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    if (val.length <= 6) setOtpCode(val);
                                                }}
                                                className={cn(
                                                    "bg-black/20 border-white/10 text-center tracking-[0.6em] font-mono h-16 rounded-2xl transition-all duration-300 text-3xl",
                                                    "focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50",
                                                    otpCode.length === 6 && "border-emerald-500/50 text-emerald-400 bg-emerald-500/5"
                                                )}
                                                placeholder="000000"
                                                maxLength={6}
                                                autoComplete="one-time-code"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                            />
                                        </div>

                                        {method === 'email' && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleSendEmail}
                                                disabled={emailCooldown > 0 || isSubmitting}
                                                className="text-xs text-purple-400 hover:text-purple-300"
                                            >
                                                {emailCooldown > 0 ? `Resend code in ${emailCooldown}s` : "Send verification code"}
                                            </Button>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isSubmitting || otpCode.length !== 6}
                                        className={cn(
                                            "w-full bg-white text-black hover:bg-neutral-200 font-bold rounded-xl h-12 transition-all duration-300",
                                            "shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                        )}
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Verify & Login"}
                                    </Button>
                                </form>
                                <Button
                                    variant="link"
                                    onClick={() => setStep('login')}
                                    className="mt-6 text-neutral-500 hover:text-white transition-colors text-xs"
                                >
                                    Login with different account
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Credits */}
            <div className="fixed bottom-4 left-0 w-full text-center text-[10px] text-white/20 uppercase tracking-[0.2em] font-light pointer-events-none">
                Secure Authentication System
            </div>
        </div>
    );
}
