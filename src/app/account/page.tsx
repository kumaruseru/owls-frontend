'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, MapPin, Save, Loader2, Lock, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const profileSchema = z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    ward: z.string().optional(),
});

const passwordSchema = z.object({
    old_password: z.string().min(1, 'Required'),
    new_password: z.string().min(8, 'Must be at least 8 characters'),
    new_password2: z.string(),
}).refine(data => data.new_password === data.new_password2, {
    message: 'Passwords do not match',
    path: ['new_password2'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AccountPage() {
    const router = useRouter();
    const { user, isAuthenticated, updateProfile } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const profileForm = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            phone: user?.phone || '',
            address: user?.address || '',
            city: user?.city || '',
            district: user?.district || '',
            ward: user?.ward || '',
        },
    });

    const passwordForm = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

    if (!isAuthenticated) {
        return null;
    }

    const onUpdateProfile = async (data: ProfileForm) => {
        setIsSubmitting(true);
        try {
            await updateProfile(data);
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Update failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const onChangePassword = async (data: PasswordForm) => {
        setIsSubmitting(true);
        try {
            await api.put('/users/change-password/', data);
            toast.success('Password changed successfully!');
            passwordForm.reset();
        } catch (error: any) {
            const errorMsg = error.response?.data?.old_password || error.response?.data?.new_password || 'Failed to change password';
            toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Fixed Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-5xl">
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-10 tracking-tight">My Account</h1>

                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                                    <div className="relative group cursor-pointer">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-white text-2xl font-bold">
                                                {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={16} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-white truncate">{user?.full_name || 'User'}</p>
                                        <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                                    </div>
                                </div>

                                <nav className="space-y-2">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                                            activeTab === 'profile'
                                                ? "bg-white/10 text-white shadow-lg shadow-purple-900/10 border border-white/5"
                                                : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <User size={18} />
                                        Profile Info
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('password')}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                                            activeTab === 'password'
                                                ? "bg-white/10 text-white shadow-lg shadow-purple-900/10 border border-white/5"
                                                : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <Lock size={18} />
                                        Security
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                            {activeTab === 'profile' && (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5">
                                    <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4">Personal Information</h2>

                                    <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">First Name</label>
                                                <input
                                                    type="text"
                                                    {...profileForm.register('first_name')}
                                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    {...profileForm.register('last_name')}
                                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                                <input
                                                    type="email"
                                                    value={user?.email || ''}
                                                    disabled
                                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-neutral-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                                <input
                                                    type="tel"
                                                    {...profileForm.register('phone')}
                                                    className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-3.5 text-neutral-500" size={18} />
                                                <input
                                                    type="text"
                                                    {...profileForm.register('address')}
                                                    placeholder="Street address..."
                                                    className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">City</label>
                                                <input
                                                    type="text"
                                                    {...profileForm.register('city')}
                                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">District</label>
                                                <input
                                                    type="text"
                                                    {...profileForm.register('district')}
                                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Ward</label>
                                                <input
                                                    type="text"
                                                    {...profileForm.register('ward')}
                                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                size="xl"
                                                className="w-full md:w-auto rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                                            >
                                                {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'password' && (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5">
                                    <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4">Change Password</h2>

                                    <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Current Password</label>
                                            <input
                                                type="password"
                                                {...passwordForm.register('old_password')}
                                                className={cn(
                                                    "w-full px-4 py-3 bg-black/20 border rounded-xl focus:outline-none focus:ring-1 transition-all text-white placeholder:text-neutral-600",
                                                    passwordForm.formState.errors.old_password
                                                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                                                        : "border-white/10 focus:border-purple-500/50 focus:ring-purple-500/50"
                                                )}
                                            />
                                            {passwordForm.formState.errors.old_password && (
                                                <p className="text-red-400 text-xs mt-1 font-medium">{passwordForm.formState.errors.old_password.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">New Password</label>
                                            <input
                                                type="password"
                                                {...passwordForm.register('new_password')}
                                                className={cn(
                                                    "w-full px-4 py-3 bg-black/20 border rounded-xl focus:outline-none focus:ring-1 transition-all text-white placeholder:text-neutral-600",
                                                    passwordForm.formState.errors.new_password
                                                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                                                        : "border-white/10 focus:border-purple-500/50 focus:ring-purple-500/50"
                                                )}
                                            />
                                            {passwordForm.formState.errors.new_password && (
                                                <p className="text-red-400 text-xs mt-1 font-medium">{passwordForm.formState.errors.new_password.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                {...passwordForm.register('new_password2')}
                                                className={cn(
                                                    "w-full px-4 py-3 bg-black/20 border rounded-xl focus:outline-none focus:ring-1 transition-all text-white placeholder:text-neutral-600",
                                                    passwordForm.formState.errors.new_password2
                                                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                                                        : "border-white/10 focus:border-purple-500/50 focus:ring-purple-500/50"
                                                )}
                                            />
                                            {passwordForm.formState.errors.new_password2 && (
                                                <p className="text-red-400 text-xs mt-1 font-medium">{passwordForm.formState.errors.new_password2.message}</p>
                                            )}
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                size="xl"
                                                className="w-full rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                                            >
                                                {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                                Update Password
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}