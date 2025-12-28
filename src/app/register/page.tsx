'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Github, Chrome, AlertCircle, User, ChevronRight, Loader2, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion, AnimatePresence } from 'framer-motion';

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    password2: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().optional(),
}).refine((data) => data.password === data.password2, {
    message: "Passwords don't match",
    path: ["password2"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { register: registerUser } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsSubmitting(true);
        try {
            await registerUser(data);
            toast.success('Account created successfully!');
            router.push('/');
        } catch (error: any) {
            console.error('Registration failed:', error);
            const errorMsg = error.response?.data?.email?.[0] ||
                error.response?.data?.username?.[0] ||
                error.response?.data?.detail ||
                'Registration failed';
            toast.error(errorMsg);
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
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[520px]"
                >
                    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-white/20 hover:shadow-purple-500/10 max-h-[75vh] flex flex-col">

                        {/* Ambient Glow */}
                        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

                        {/* Header */}
                        <div className="p-8 pb-4 text-center relative z-10 flex-none">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-500">
                                <User className="text-purple-300" size={24} />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create Account</h1>
                            <p className="text-neutral-400 text-xs leading-relaxed max-w-[280px] mx-auto">
                                Join us to access exclusive products.
                            </p>
                        </div>

                        {/* Form Scrollable Area */}
                        <div className="p-8 pt-0 relative z-10 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 transition-all">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                                {/* Name Fields Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">First Name</label>
                                        <Input
                                            placeholder="John"
                                            {...register('first_name')}
                                            className="h-11 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Last Name</label>
                                        <Input
                                            placeholder="Doe"
                                            {...register('last_name')}
                                            className="h-11 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Username</label>
                                    <div className="relative group/input">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within/input:text-purple-400" size={18} />
                                        <Input
                                            type="text"
                                            placeholder="username"
                                            {...register('username')}
                                            className="h-11 pl-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all duration-300 font-medium"
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {errors.username && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-center gap-2 text-red-400 text-xs ml-1 font-medium overflow-hidden"
                                            >
                                                <AlertCircle size={12} />
                                                <span>{errors.username.message}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email</label>
                                    <div className="relative group/input">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within/input:text-purple-400" size={18} />
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            {...register('email')}
                                            className="h-11 pl-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all duration-300 font-medium"
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

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Phone (Optional)</label>
                                    <div className="relative group/input">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within/input:text-purple-400" size={18} />
                                        <Input
                                            type="text"
                                            placeholder="+84 ..."
                                            {...register('phone')}
                                            className="h-11 pl-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all duration-300 font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Password Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Password</label>
                                        <div className="relative group/input">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within/input:text-purple-400" size={18} />
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••"
                                                {...register('password')}
                                                className="h-11 pl-12 pr-8 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Confirm</label>
                                        <div className="relative group/input">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within/input:text-purple-400" size={18} />
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••"
                                                {...register('password2')}
                                                className="h-11 pl-12 pr-8 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all font-medium"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-1"
                                            >
                                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {(errors.password || errors.password2) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-2 text-red-400 text-xs ml-1 font-medium overflow-hidden justify-center"
                                        >
                                            <AlertCircle size={12} />
                                            <span>{errors.password?.message || errors.password2?.message}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-12 rounded-xl bg-white text-black font-bold text-base hover:bg-neutral-200 transition-all duration-300 mt-4 relative overflow-hidden group/btn"
                                    disabled={isSubmitting}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin h-5 w-5" />
                                                <span>Creating Account...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign Up</span>
                                                <ChevronRight size={18} className="opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                                            </>
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/5"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase font-medium tracking-wider">
                                    <span className="bg-[#050505] px-3 text-neutral-600">Or continue with</span>
                                </div>
                            </div>

                            {/* Social Login */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-neutral-300 gap-2 transition-all">
                                    <Chrome size={18} />
                                    Google
                                </Button>
                                <Button variant="outline" className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-neutral-300 gap-2 transition-all">
                                    <Github size={18} />
                                    Github
                                </Button>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 text-center text-sm text-neutral-500">
                                Already have an account? <Link href="/login" className="text-white font-bold hover:text-purple-400 transition-colors ml-1">Log In</Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer Credits */}
            <div className="fixed bottom-4 left-0 w-full text-center text-[10px] text-white/20 uppercase tracking-[0.2em] font-light pointer-events-none">
                Secure Authentication System
            </div>
        </div>
    );
}
