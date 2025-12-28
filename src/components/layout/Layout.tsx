"use client";

import { Suspense } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-background font-sans antialiased selection:bg-primary/30 selection:text-primary-foreground">
            <Suspense fallback={null}>
                <Header />
            </Suspense>
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
