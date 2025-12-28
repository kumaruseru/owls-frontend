"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Save, Lock, LayoutGrid, Phone, Loader2, Globe, ShieldAlert, CreditCard, Share2, Truck, LogOut, CheckCircle, Key, AlertTriangle, Shield, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/ui/input';

// --- Password Schema ---
const passwordSchema = z.object({
    old_password: z.string().min(1, 'Required'),
    new_password: z.string()
        .min(8, 'Must be at least 8 characters')
        .regex(/\d/, 'Must contain at least one number')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one special character'),
    new_password2: z.string(),
}).refine(data => data.new_password === data.new_password2, {
    message: 'Passwords do not match',
    path: ['new_password2'],
});
type PasswordForm = z.infer<typeof passwordSchema>;

interface SiteConfig {
    site_name: string;
    site_description: string;
    contact_email: string;
    phone_number: string;
    address: string;
    social_links: Record<string, string>;
    maintenance_mode: boolean;
    enable_cod: boolean;
    enable_stripe: boolean;
    shipping_fee_flat: number;
    free_shipping_threshold: number;
}

export default function SettingsPage() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'payment_shipping' | 'social' | 'security'>('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Config State
    const [config, setConfig] = useState<SiteConfig>({
        site_name: "",
        site_description: "",
        contact_email: "",
        phone_number: "",
        address: "",
        social_links: {},
        maintenance_mode: false,
        enable_cod: true,
        enable_stripe: false,
        shipping_fee_flat: 0,
        free_shipping_threshold: 0,
    });

    const passwordForm = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await api.get("/core/config/");
            const data = response.data;
            // Initialize social_links if missing
            if (!data.social_links) data.social_links = { facebook: '', instagram: '', twitter: '', youtube: '' };
            setConfig(data);
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            // Fallback default if API fails or is empty initially
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveConfig = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            // Using ID 1 because SiteConfig is a singleton ensuring pk=1
            await api.patch("/core/config/1/", config);
            toast.success("Settings updated successfully!");
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const onChangePassword = async (data: PasswordForm) => {
        setIsSaving(true);
        try {
            await api.put('/auth/change-password/', data);
            toast.success('Password changed successfully!');
            passwordForm.reset();
        } catch (error: any) {
            console.error(error);
            const errorMsg = error.response?.data?.old_password || error.response?.data?.new_password || 'Failed to change password';
            toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const updateSocial = (key: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            social_links: {
                ...prev.social_links,
                [key]: value
            }
        }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-purple-500" size={32} />
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

            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-10">
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">System Settings</h1>
                        <p className="text-neutral-400">Manage global store configuration and preferences.</p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-xl sticky top-32">
                                <nav className="space-y-2">
                                    {[
                                        { id: 'general', label: 'General', icon: LayoutGrid },
                                        { id: 'contact', label: 'Contact Info', icon: Phone },
                                        { id: 'payment_shipping', label: 'Payment & Shipping', icon: Truck },
                                        { id: 'social', label: 'Social Media', icon: Share2 },
                                        { id: 'security', label: 'Security', icon: Lock },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id as any)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                                                activeTab === item.id
                                                    ? "bg-white/10 text-white shadow-lg shadow-purple-900/10 border border-white/5"
                                                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <item.icon size={18} />
                                            {item.label}
                                        </button>
                                    ))}

                                    <div className="h-px bg-white/10 my-2 mx-4" />

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3">

                            {/* General Settings Tab */}
                            {activeTab === 'general' && (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-2">
                                        <Globe size={20} className="text-purple-400" />
                                        General Information
                                    </h2>

                                    <form onSubmit={handleSaveConfig} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Store Name</label>
                                            <Input
                                                value={config.site_name}
                                                onChange={(e) => setConfig({ ...config, site_name: e.target.value })}
                                                className="bg-black/20 border-white/10 h-12 rounded-xl focus:border-purple-500/50"
                                                placeholder="My Awesome Store"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Store Description</label>
                                            <textarea
                                                rows={4}
                                                value={config.site_description}
                                                onChange={(e) => setConfig({ ...config, site_description: e.target.value })}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all resize-none"
                                            />
                                        </div>

                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-white text-sm">Maintenance Mode</div>
                                                <div className="text-xs text-neutral-400 mt-1">Temporarily disable the public storefront</div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={config.maintenance_mode}
                                                    onChange={(e) => setConfig({ ...config, maintenance_mode: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>

                                        <div className="pt-4 border-t border-white/10">
                                            <Button type="submit" disabled={isSaving} size="xl" className="w-full md:w-auto rounded-xl font-bold uppercase tracking-wider bg-white text-black hover:bg-neutral-200 shadow-lg">
                                                {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                                Save Settings
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Contact Settings Tab */}
                            {activeTab === 'contact' && (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-2">
                                        <Phone size={20} className="text-blue-400" />
                                        Contact Information
                                    </h2>

                                    <form onSubmit={handleSaveConfig} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Support Email</label>
                                                <Input
                                                    type="email"
                                                    value={config.contact_email}
                                                    onChange={(e) => setConfig({ ...config, contact_email: e.target.value })}
                                                    className="bg-black/20 border-white/10 h-12 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Phone Number</label>
                                                <Input
                                                    type="text"
                                                    value={config.phone_number}
                                                    onChange={(e) => setConfig({ ...config, phone_number: e.target.value })}
                                                    className="bg-black/20 border-white/10 h-12 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Physical Address</label>
                                            <textarea
                                                rows={3}
                                                value={config.address}
                                                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all resize-none"
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-white/10">
                                            <Button type="submit" disabled={isSaving} size="xl" className="w-full md:w-auto rounded-xl font-bold uppercase tracking-wider bg-white text-black hover:bg-neutral-200 shadow-lg">
                                                {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                                Update Contact Info
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Payment & Shipping Tab */}
                            {activeTab === 'payment_shipping' && (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-2">
                                        <CreditCard size={20} className="text-emerald-400" />
                                        Payment & Shipping
                                    </h2>

                                    <form onSubmit={handleSaveConfig} className="space-y-8">
                                        {/* Payment Methods */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Payment Methods</h3>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                                                    <div>
                                                        <div className="font-bold text-white text-sm">Cash on Delivery (COD)</div>
                                                        <div className="text-xs text-neutral-400 mt-1">Allow customers to pay upon receipt</div>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={config.enable_cod}
                                                            onChange={(e) => setConfig({ ...config, enable_cod: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                    </label>
                                                </div>

                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors">
                                                    <div>
                                                        <div className="font-bold text-white text-sm">Stripe / Credit Card</div>
                                                        <div className="text-xs text-neutral-400 mt-1">Accept secure online payments</div>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={config.enable_stripe}
                                                            onChange={(e) => setConfig({ ...config, enable_stripe: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px bg-white/10" />

                                        {/* Shipping Config */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Shipping Configuration</h3>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Flat Rate Shipping (VND)</label>
                                                    <Input
                                                        type="number"
                                                        value={config.shipping_fee_flat}
                                                        onChange={(e) => setConfig({ ...config, shipping_fee_flat: Number(e.target.value) })}
                                                        className="bg-black/20 border-white/10 h-12 rounded-xl font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Free Shipping Threshold (VND)</label>
                                                    <Input
                                                        type="number"
                                                        value={config.free_shipping_threshold}
                                                        onChange={(e) => setConfig({ ...config, free_shipping_threshold: Number(e.target.value) })}
                                                        className="bg-black/20 border-white/10 h-12 rounded-xl font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/10">
                                            <Button type="submit" disabled={isSaving} size="xl" className="w-full md:w-auto rounded-xl font-bold uppercase tracking-wider bg-white text-black hover:bg-neutral-200 shadow-lg">
                                                {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                                Save Configuration
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Social Media Tab */}
                            {activeTab === 'social' && (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-2">
                                        <Share2 size={20} className="text-pink-400" />
                                        Social Media Links
                                    </h2>

                                    <form onSubmit={handleSaveConfig} className="space-y-6">
                                        <div className="grid gap-6">
                                            {['facebook', 'instagram', 'twitter', 'youtube'].map(platform => (
                                                <div key={platform} className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1 capitalize">{platform}</label>
                                                    <Input
                                                        type="text"
                                                        value={config.social_links[platform] || ''}
                                                        onChange={(e) => updateSocial(platform, e.target.value)}
                                                        className="bg-black/20 border-white/10 h-12 rounded-xl"
                                                        placeholder={`https://${platform}.com/yourpage`}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-white/10">
                                            <Button type="submit" disabled={isSaving} size="xl" className="w-full md:w-auto rounded-xl font-bold uppercase tracking-wider bg-white text-black hover:bg-neutral-200 shadow-lg">
                                                {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                                Update Social Links
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Security Settings Tab */}
                            {activeTab === 'security' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5 transition-all hover:bg-white/[0.07]">
                                        <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/10 rounded-xl">
                                                <Key className="text-purple-400" size={20} />
                                            </div>
                                            Change Admin Password
                                        </h2>

                                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                                            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Current Password</label>
                                                    <Input
                                                        type="password"
                                                        placeholder="Enter current password"
                                                        {...passwordForm.register('old_password')}
                                                        className={cn(
                                                            "bg-black/20 border-white/10 h-12 rounded-xl focus:border-purple-500/50 transition-all",
                                                            passwordForm.formState.errors.old_password && "border-red-500/50 focus:border-red-500"
                                                        )}
                                                    />
                                                    {passwordForm.formState.errors.old_password && (
                                                        <p className="text-red-400 text-xs ml-1 flex items-center gap-1">
                                                            <AlertTriangle size={12} />
                                                            {passwordForm.formState.errors.old_password.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">New Password</label>
                                                    <Input
                                                        type="password"
                                                        placeholder="Min. 8 characters"
                                                        {...passwordForm.register('new_password')}
                                                        className={cn(
                                                            "bg-black/20 border-white/10 h-12 rounded-xl focus:border-purple-500/50 transition-all",
                                                            passwordForm.formState.errors.new_password && "border-red-500/50 focus:border-red-500"
                                                        )}
                                                    />
                                                    {passwordForm.formState.errors.new_password && (
                                                        <p className="text-red-400 text-xs ml-1 flex items-center gap-1">
                                                            <AlertTriangle size={12} />
                                                            {passwordForm.formState.errors.new_password.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Confirm New Password</label>
                                                    <Input
                                                        type="password"
                                                        placeholder="Re-enter new password"
                                                        {...passwordForm.register('new_password2')}
                                                        className={cn(
                                                            "bg-black/20 border-white/10 h-12 rounded-xl focus:border-purple-500/50 transition-all",
                                                            passwordForm.formState.errors.new_password2 && "border-red-500/50 focus:border-red-500"
                                                        )}
                                                    />
                                                    {passwordForm.formState.errors.new_password2 && (
                                                        <p className="text-red-400 text-xs ml-1 flex items-center gap-1">
                                                            <AlertTriangle size={12} />
                                                            {passwordForm.formState.errors.new_password2.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="pt-2">
                                                    <Button
                                                        type="submit"
                                                        disabled={isSaving}
                                                        size="xl"
                                                        className="w-full rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                                                    >
                                                        {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                                        Update Password
                                                    </Button>
                                                </div>
                                            </form>

                                            {/* Password Requirements Column */}
                                            <div className="space-y-6 pt-2">
                                                <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                                                    <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                                                        <Shield size={16} className="text-purple-400" />
                                                        Password Requirements
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {[
                                                            { text: "At least 8 characters long", met: (passwordForm.watch('new_password') || '').length >= 8 },
                                                            { text: "Contains at least one number", met: /\d/.test(passwordForm.watch('new_password') || '') },
                                                            { text: "Contains at least one uppercase letter", met: /[A-Z]/.test(passwordForm.watch('new_password') || '') },
                                                            { text: "Contains at least one special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.watch('new_password') || '') },
                                                        ].map((req, i) => (
                                                            <div key={i} className="flex items-center gap-3 text-sm transition-colors duration-300">
                                                                <div className={cn(
                                                                    "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 border",
                                                                    req.met
                                                                        ? "bg-emerald-500 border-emerald-500"
                                                                        : "bg-white/5 border-white/10"
                                                                )}>
                                                                    {req.met && <Check size={10} className="text-white font-bold" />}
                                                                </div>
                                                                <span className={cn(
                                                                    "transition-colors duration-300",
                                                                    req.met ? "text-neutral-200 font-medium" : "text-neutral-500"
                                                                )}>
                                                                    {req.text}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-purple-500/5 rounded-2xl p-6 border border-purple-500/10 space-y-3">
                                                    <h3 className="text-purple-300 font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                                                        <ShieldAlert size={16} />
                                                        Security Tips
                                                    </h3>
                                                    <ul className="text-xs text-neutral-400 space-y-2 list-disc pl-4">
                                                        <li>Avoid using personal information like birthdays.</li>
                                                        <li>Don't use easy-to-guess sequences like "123456".</li>
                                                        <li>Use a combination of unrelated words.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
