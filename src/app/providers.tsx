'use client';

import { ReactLenis } from '@studio-freight/react-lenis'

import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: any }) {
    return (
        <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
            {children}
            <Toaster
                position="top-center"
                toastOptions={{
                    className: 'bg-black/80 backdrop-blur-xl border border-white/10 text-white',
                    style: {
                        background: 'rgba(5, 5, 5, 0.8)',
                        color: '#fff',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '12px 24px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: 500,
                    },
                    success: {
                        iconTheme: {
                            primary: '#a855f7', // Purple-500
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444', // Red-500
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </ReactLenis>
    );
}
