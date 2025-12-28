"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const { socialLogin } = useAuthStore();
    const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        if (!code) {
            toast.error('No authorization code found');
            router.replace('/login');
            return;
        }

        const handleLogin = async () => {
            try {
                // If state is not present, we might assume github for legacy or show error
                // For now, let's default to github if missing, or use 'google' if state is google
                const provider = state === 'google' ? 'google' : 'github';

                await socialLogin(provider, code);
                setStatus('success');
                toast.success(`Successfully logged in with ${provider === 'google' ? 'Google' : 'GitHub'}`);
                router.replace('/');
            } catch (error: any) {
                setStatus('error');
                const msg = error.response?.data?.error || 'Failed to login with social account';
                toast.error(msg);
                setTimeout(() => router.replace('/login'), 2000);
            }
        };

        handleLogin();
    }, [code, state, router, socialLogin]);

    return (
        <div className="text-center">
            {status === 'loading' && (
                <>
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-purple-500 mb-4" />
                    <h2 className="text-xl font-medium text-neutral-300">Authenticating with GitHub...</h2>
                </>
            )}
            {status === 'error' && (
                <>
                    <div className="w-10 h-10 mx-auto text-red-500 mb-4 text-2xl font-bold">!</div>
                    <h2 className="text-xl font-medium text-red-400">Authentication Failed</h2>
                    <p className="text-neutral-500 text-sm mt-2">Redirecting to login...</p>
                </>
            )}
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-purple-500" />}>
                <CallbackContent />
            </Suspense>
        </div>
    );
}
