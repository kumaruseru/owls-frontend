'use client';

import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-background font-sans antialiased selection:bg-primary/30 selection:text-primary-foreground">
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                        padding: '16px',
                        borderRadius: '12px',
                    },
                    success: {
                        iconTheme: {
                            primary: 'var(--primary)',
                            secondary: 'var(--primary-foreground)',
                        },
                    },
                }}
            />
            <Header />
            <main className="flex-1"> {/* Removed padding-top for full overlap support */}
                {children}
            </main>
            <Footer />
        </div>
    );
}
