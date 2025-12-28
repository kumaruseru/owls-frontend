"use client";

import { AuroraBackground } from '@/components/ui/aurora-background';
import { Construction, Clock, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30 flex items-center justify-center relative overflow-hidden">
            {/* Fixed Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            <div className="relative z-10 max-w-2xl px-6 text-center">
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-xl shadow-2xl shadow-purple-500/10 animate-pulse">
                    <Construction size={48} className="text-purple-400" />
                </div>

                <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight">
                    Under Maintenance
                </h1>

                <p className="text-lg md:text-xl text-neutral-400 mb-10 leading-relaxed">
                    We're currently making some improvements to our store to provide you with a better experience. We'll be back online shortly!
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-neutral-300">
                        <Clock size={18} className="text-purple-400" />
                        <span>Estimated downtime: ~1 hour</span>
                    </div>

                    <a href="mailto:support@owls.com" className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10 transition-colors">
                        <Mail size={18} className="text-blue-400" />
                        <span>Contact Support</span>
                    </a>
                </div>

                <div className="mt-16 text-sm text-neutral-500">
                    &copy; {new Date().getFullYear()} OWLS. All rights reserved.
                </div>
            </div>
        </div>
    );
}
