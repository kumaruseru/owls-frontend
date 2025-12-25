'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Github, Chrome, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be 3+ chars'),
    email: z.string().email('Invalid Email'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be 6+ chars'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
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
            await registerUser({
                username: data.username,
                email: data.email,
                password: data.password,
                password2: data.confirmPassword,
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phone,
            });
            toast.success('Account created successfully');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen relative w-full bg-black text-white font-sans selection:bg-purple-500/30">

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            <div className="relative z-10 min-h-screen w-full flex items-center justify-center p-4 py-12">
                {/* Back Button */}
                <div className="absolute top-8 left-8 z-50">
                    <Button
                        asChild
                        variant="ghost"
                        className="group text-white/60 hover:text-white hover:bg-white/10 rounded-full px-4"
                    >
                        <Link href="/" className="flex items-center gap-2">
                            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                            <span className="font-medium">Back</span>
                        </Link>
                    </Button>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[500px]"
                >
                    <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-purple-900/10">

                        {/* Header Form */}
                        <div className="p-8 pb-0 text-center">
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner">
                                <User className="text-purple-400" size={24} />
                            </div>
                            <h1 className="text-3xl font-display font-bold tracking-tight text-white mb-2">Create Account</h1>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                Join the OWLS community and experience the future.
                            </p>
                        </div>

                        {/* Form */}
                        <div className="p-8">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                                <div className="grid grid-cols-2 gap-4">
                                    {/* First Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">First Name</label>
                                        <Input
                                            placeholder="John"
                                            {...register('firstName')}
                                            className="h-11 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all"
                                        />
                                    </div>
                                    {/* Last Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Last Name</label>
                                        <Input
                                            placeholder="Doe"
                                            {...register('lastName')}
                                            className="h-11 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Username</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-purple-400" size={18} />
                                        <Input
                                            placeholder="johndoe123"
                                            {...register('username')}
                                            className="h-11 pl-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all"
                                        />
                                    </div>
                                    <AnimatePresence mode="wait">
                                        {errors.username && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="flex items-center gap-2 text-red-400 text-xs ml-1 font-medium mt-1.5"
                                            >
                                                <AlertCircle size={12} />
                                                <span>{errors.username.message}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-purple-400" size={18} />
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            {...register('email')}
                                            className="h-11 pl-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all"
                                        />
                                    </div>
                                    <AnimatePresence mode="wait">
                                        {errors.email && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="flex items-center gap-2 text-red-400 text-xs ml-1 font-medium mt-1.5"
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
                                    <Input
                                        placeholder="+84 123 456 789"
                                        {...register('phone')}
                                        className="h-11 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all"
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-purple-400" size={18} />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            {...register('password')}
                                            className="h-11 pl-12 pr-10 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <AnimatePresence mode="wait">
                                        {errors.password && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="flex items-center gap-2 text-red-400 text-xs ml-1 font-medium mt-1.5"
                                            >
                                                <AlertCircle size={12} />
                                                <span>{errors.password.message}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-purple-400" size={18} />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            {...register('confirmPassword')}
                                            className="h-11 pl-12 pr-10 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:ring-0 transition-all"
                                        />
                                    </div>
                                    <AnimatePresence mode="wait">
                                        {errors.confirmPassword && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="flex items-center gap-2 text-red-400 text-xs ml-1 font-medium mt-1.5"
                                            >
                                                <AlertCircle size={12} />
                                                <span>{errors.confirmPassword.message}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-12 rounded-xl bg-white text-black font-bold text-base hover:bg-neutral-200 transition-all mt-4"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                                            Creating ID...
                                        </span>
                                    ) : "Create Account"}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#0a0a0a] px-2 text-neutral-500">Or sign up with</span>
                                </div>
                            </div>

                            {/* Social Login */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-neutral-300 gap-2">
                                    <Chrome size={18} />
                                    Google
                                </Button>
                                <Button variant="outline" className="h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-neutral-300 gap-2">
                                    <Github size={18} />
                                    Github
                                </Button>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 text-center text-sm text-neutral-500">
                                Already have an account? <Link href="/login" className="text-white font-bold hover:text-purple-400 transition-colors">Sign In</Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}