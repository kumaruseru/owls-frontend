'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Save, Loader2, Shield, Trash2, AlertTriangle, Check, ShieldAlert, Key, Copy, RefreshCcw, Eye, EyeOff, Chrome, Github, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore, type User } from '@/store/auth-store';

// --- Password Schema & Form ---
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

interface SecurityTabProps {
    user: User | null; // Allow null to prevent crash if user is loading
}

export function SecurityTab({ user }: SecurityTabProps) {
    const router = useRouter();
    const { logout, updateProfile, socialAccounts, fetchSocialAccounts, disconnectSocialAccount } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchSocialAccounts();
    }, [fetchSocialAccounts]);

    // Format date helper
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // 2FA State
    const [is2FALoading, setIs2FALoading] = useState(false);
    const [setupStep, setSetupStep] = useState<'idle' | 'qr' | 'disable' | 'backup'>('idle');
    const [qrData, setQrData] = useState<{ qr_code: string; secret: string } | null>(null);
    const [otpCode, setOtpCode] = useState("");

    // Delete Account State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const passwordForm = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

    // --- Actions ---

    const onChangePassword = async (data: PasswordForm) => {
        setIsSubmitting(true);
        try {
            await api.put('/auth/change-password/', data);
            toast.success('Password changed successfully!');
            passwordForm.reset();
        } catch (error: any) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            const errorMsg = err.response?.data?.old_password || err.response?.data?.new_password || 'Failed to change password';
            toast.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error('Please enter your password to confirm');
            return;
        }
        setIsDeleting(true);
        try {
            await api.delete('/auth/delete-account/', {
                data: { password: deletePassword }
            });
            toast.success('Account deleted successfully');
            logout();
            router.push('/');
        } catch (error: any) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast.error(err.response?.data?.error || 'Failed to delete account');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. Change Password Section */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5 transition-all hover:bg-white/[0.07]">
                <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-xl">
                        <Key className="text-purple-400" size={20} />
                    </div>
                    Đổi mật khẩu
                </h2>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Mật khẩu hiện tại</label>
                            <Input
                                type="password"
                                placeholder="Nhập mật khẩu hiện tại"
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
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Mật khẩu mới</label>
                            <Input
                                type="password"
                                placeholder="Ít nhất 8 ký tự"
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
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Xác nhận mật khẩu mới</label>
                            <Input
                                type="password"
                                placeholder="Nhập lại mật khẩu mới"
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
                                disabled={isSubmitting}
                                size="xl"
                                className="w-full rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                Cập nhật mật khẩu
                            </Button>
                        </div>
                    </form>

                    {/* Password Requirements Column */}
                    <div className="space-y-6 pt-2">
                        <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                            <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                                <Shield size={16} className="text-purple-400" />
                                Yêu cầu mật khẩu
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { text: "Ít nhất 8 ký tự", met: (passwordForm.watch('new_password') || '').length >= 8 },
                                    { text: "Chứa ít nhất một số", met: /\d/.test(passwordForm.watch('new_password') || '') },
                                    { text: "Chứa ít nhất một chữ hoa", met: /[A-Z]/.test(passwordForm.watch('new_password') || '') },
                                    { text: "Chứa ít nhất một ký tự đặc biệt", met: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.watch('new_password') || '') },
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
                                Lời khuyên bảo mật
                            </h3>
                            <ul className="text-xs text-neutral-400 space-y-2 list-disc pl-4">
                                <li>Tránh sử dụng thông tin cá nhân như ngày sinh.</li>
                                <li>Không dùng chuỗi dễ đoán như "123456".</li>
                                <li>Sử dụng kết hợp các từ không liên quan.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Connected Accounts Section */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5 transition-all hover:bg-white/[0.07]">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                        <Link className="text-blue-400" size={20} />
                    </div>
                    Tài khoản liên kết
                </h2>

                <div className="space-y-4">
                    {/* Google */}
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                <Chrome size={20} className="text-black" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">Google</h3>
                                {socialAccounts?.find(a => a.provider === 'google') ? (
                                    <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                                        <Check size={12} /> Đã liên kết • {formatDate(socialAccounts.find(a => a.provider === 'google')!.created_at)}
                                    </p>
                                ) : (
                                    <p className="text-xs text-neutral-500">Chưa liên kết</p>
                                )}
                            </div>
                        </div>
                        {socialAccounts?.find(a => a.provider === 'google') ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => disconnectSocialAccount('google')}
                                className="text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                                Hủy liên kết
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/social/google/`}
                                className="bg-white/10 hover:bg-white/20 text-white border-0"
                            >
                                Liên kết
                            </Button>
                        )}
                    </div>

                    {/* GitHub */}
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                <Github size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">GitHub</h3>
                                {socialAccounts?.find(a => a.provider === 'github') ? (
                                    <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                                        <Check size={12} /> Đã liên kết • {formatDate(socialAccounts.find(a => a.provider === 'github')!.created_at)}
                                    </p>
                                ) : (
                                    <p className="text-xs text-neutral-500">Chưa liên kết</p>
                                )}
                            </div>
                        </div>
                        {socialAccounts?.find(a => a.provider === 'github') ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => disconnectSocialAccount('github')}
                                className="text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                                Hủy liên kết
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/social/github/`}
                                className="bg-white/10 hover:bg-white/20 text-white border-0"
                            >
                                Liên kết
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Two-Factor Authentication Section */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5 transition-all hover:bg-white/[0.07]">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                        <Shield className="text-blue-400" size={20} />
                    </div>
                    Xác thực hai lớp (2FA)
                    {user?.is_2fa_enabled && <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold uppercase ml-2 border border-emerald-500/20">Đang bật</span>}
                </h2>

                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-white font-medium text-lg">
                                {user?.is_2fa_enabled ? "2FA đang hoạt động" : "Bật 2FA"}
                            </p>
                            <p className="text-sm text-neutral-400 max-w-sm">
                                {user?.is_2fa_enabled
                                    ? "Tài khoản của bạn được bảo vệ bởi xác thực hai lớp."
                                    : "Bảo vệ tài khoản của bạn với một lớp bảo mật bổ sung. Chúng tôi sẽ yêu cầu mã khi bạn đăng nhập."}
                            </p>
                        </div>

                        {!user?.is_2fa_enabled ? (
                            <Button
                                onClick={async () => {
                                    setIs2FALoading(true);
                                    try {
                                        const res = await api.get('/auth/2fa/enable/');
                                        setQrData(res.data);
                                        setSetupStep('qr');
                                    } catch {
                                        toast.error("Không thể bắt đầu thiết lập 2FA");
                                    } finally {
                                        setIs2FALoading(false);
                                    }
                                }}
                                disabled={is2FALoading || setupStep === 'qr'}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                            >
                                {is2FALoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                                Thiết lập 2FA
                            </Button>
                        ) : (
                            <Button
                                variant="destructive"
                                onClick={() => setSetupStep('disable')}
                                className="bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-500/20 rounded-xl"
                            >
                                Tắt 2FA
                            </Button>
                        )}
                    </div>

                    {/* Setup Flow: QR Code */}
                    {setupStep === 'qr' && !user?.is_2fa_enabled && qrData && (
                        <div className="mt-4 p-6 bg-black/20 rounded-2xl border border-white/10 animate-in slide-in-from-top-2">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="flex flex-col items-center justify-center space-y-4 p-4 bg-white rounded-xl">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={qrData.qr_code} alt="2FA QR Code" className="w-40 h-40" />
                                    <div className="text-center">
                                        <p className="text-xs text-neutral-500 font-mono mb-1">Secret Key:</p>
                                        <code className="text-sm font-bold text-black bg-neutral-100 px-2 py-1 rounded select-all">{qrData.secret}</code>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-white font-bold mb-1">1. Quét mã QR</h3>
                                        <p className="text-sm text-neutral-400">Sử dụng ứng dụng xác thực (Google Authenticator, Authy) để quét mã QR.</p>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold mb-2">2. Nhập mã xác thực</h3>
                                        <div className="flex gap-2">
                                            <Input
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                                placeholder="000 000"
                                                className="bg-white/5 border-white/10 text-white font-mono text-center tracking-widest text-lg h-11"
                                                maxLength={6}
                                            />
                                            <Button
                                                onClick={async () => {
                                                    try {
                                                        await api.post('/auth/2fa/confirm/', { code: otpCode });
                                                        toast.success("Đã bật 2FA thành công!");
                                                        setSetupStep('idle');
                                                        setQrData(null);
                                                        setOtpCode("");
                                                        // Refresh user profile
                                                        updateProfile({ is_2fa_enabled: true });
                                                    } catch (error: any) {
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        const err = error as any;
                                                        toast.error(err.response?.data?.error || "Mã không hợp lệ");
                                                    }
                                                }}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[100px]"
                                            >
                                                Xác nhận
                                            </Button>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSetupStep('idle')} className="text-neutral-400 hover:text-white">Hủy</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Disable Flow */}
                    {setupStep === 'disable' && user?.is_2fa_enabled && (
                        <div className="mt-4 p-6 bg-red-500/5 rounded-2xl border border-red-500/10 animate-in slide-in-from-top-2">
                            <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} /> Xác nhận tắt 2FA
                            </h3>
                            <p className="text-sm text-neutral-400 mb-4">Vui lòng nhập mật khẩu để tắt Xác thực hai lớp.</p>
                            <div className="flex gap-2 max-w-md">
                                <Input
                                    type="password"
                                    value={deletePassword} // Reusing deletePassword state for convenience or add new state
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Mật khẩu hiện tại"
                                    className="bg-black/20 border-white/10 text-white"
                                />
                                <Button
                                    onClick={async () => {
                                        try {
                                            await api.post('/auth/2fa/disable/', { password: deletePassword });
                                            toast.success("Đã tắt 2FA");
                                            setSetupStep('idle');
                                            setDeletePassword("");
                                            updateProfile({ is_2fa_enabled: false });
                                        } catch (error: any) {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            const err = error as any;
                                            toast.error(err.response?.data?.error || "Mật khẩu không đúng");
                                        }
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Tắt
                                </Button>
                                <Button variant="ghost" onClick={() => { setSetupStep('idle'); setDeletePassword(""); }} className="text-neutral-400">Hủy</Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Backup Codes Section */}
                {user?.is_2fa_enabled && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold text-lg mb-1">Mã sao lưu</h3>
                                <p className="text-sm text-neutral-400">
                                    Mã này dùng để đăng nhập khi bạn mất điện thoại hoặc không thể nhận mã OTP.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setSetupStep((prev) => prev === 'backup' ? 'idle' : 'backup')}
                                className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                            >
                                {setupStep === 'backup' ? 'Đóng' : 'Xem mã'}
                            </Button>
                        </div>

                        {setupStep === 'backup' && (
                            <BackupCodesManager
                                onClose={() => setSetupStep('idle')}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* 3. Delete Account Section */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-red-900/5 transition-all hover:bg-red-500/10">
                <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-xl">
                        <ShieldAlert className="text-red-500" size={20} />
                    </div>
                    Vùng nguy hiểm
                </h2>

                <p className="text-sm text-neutral-400 mb-6 max-w-xl leading-relaxed">
                    Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn. Hành động này không thể hoàn tác. Vui lòng cân nhắc kỹ.
                </p>

                {!showDeleteConfirm ? (
                    <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-500/20 hover:border-red-600 transition-all rounded-xl h-12 px-6 font-bold uppercase tracking-wider text-xs"
                    >
                        <Trash2 size={16} className="mr-2" />
                        Xóa tài khoản
                    </Button>
                ) : (
                    <div className="bg-black/40 p-6 rounded-2xl border border-red-500/20 space-y-4 animate-in fade-in slide-in-from-top-2 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                            <AlertTriangle size={16} />
                            Bạn có chắc chắn không?
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Xác nhận mật khẩu</label>
                            <Input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="bg-black/20 border-red-500/20 h-12 rounded-xl focus:border-red-500/50 text-white placeholder:text-neutral-600 transition-all"
                                placeholder="Nhập mật khẩu để xác nhận xóa"
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                variant="destructive"
                                disabled={isDeleting}
                                onClick={onDeleteAccount}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all"
                            >
                                {isDeleting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
                                Xác nhận xóa
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeletePassword('');
                                }}
                                className="text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl h-11"
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function BackupCodesManager({ onClose }: { onClose: () => void }) {
    const [password, setPassword] = useState('');
    const [codes, setCodes] = useState<string[]>([]);
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(false);

    const onFetchCodes = async (e?: React.FormEvent, forceRegenerate = false) => {
        e?.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/2fa/backup-codes/', {
                password,
                action: forceRegenerate ? 'regenerate' : 'view'
            });
            setCodes(res.data.backup_codes);
            setIsVerified(true);
            if (forceRegenerate) toast.success("Đã tạo mới mã dự phòng");
        } catch (error: any) {
            const err = error as any;
            toast.error(err.response?.data?.error || "Mật khẩu không đúng");
        } finally {
            setLoading(false);
        }
    };

    if (!isVerified) {
        return (
            <div className="mt-6 p-6 bg-black/20 rounded-2xl border border-white/10 animate-in slide-in-from-top-2">
                <h3 className="text-white font-bold mb-2">Nhập mật khẩu để xem mã</h3>
                <div className="flex gap-2 max-w-md">
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mật khẩu của bạn"
                        className="bg-white/5 border-white/10 text-white"
                    />
                    <Button onClick={(e) => onFetchCodes(e)} disabled={loading} className="bg-white text-black hover:bg-neutral-200">
                        {loading ? <Loader2 className="animate-spin" /> : "Xác nhận"}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 p-6 bg-black/20 rounded-2xl border border-white/10 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Key size={16} className="text-purple-400" />
                    Mã dự phòng của bạn
                </h3>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onFetchCodes(undefined, true)}
                        className="h-8 text-xs border-white/10 text-neutral-400 hover:text-white"
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={12} className="animate-spin mr-1" /> : <RefreshCcw size={12} className="mr-1" />}
                        Tạo mới
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border-0"
                        onClick={() => {
                            navigator.clipboard.writeText(codes.join('\n'));
                            toast.success("Đã sao chép vào bộ nhớ đệm");
                        }}
                    >
                        <Copy size={12} className="mr-1" /> Sao chép
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {codes.map((code, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-center">
                        <code className="text-sm font-mono text-emerald-400 tracking-wider">
                            {code}
                        </code>
                    </div>
                ))}
            </div>

            <p className="text-xs text-neutral-500 mt-4">
                * Lưu ý: Mỗi mã chỉ có thể sử dụng một lần. Hãy lưu lại ở nơi an toàn.
            </p>
        </div>
    );
}
