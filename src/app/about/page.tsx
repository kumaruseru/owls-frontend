'use client';

import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion } from 'framer-motion';
import { Cpu, Heart, Shield, Zap, Globe, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
    const values = [
        {
            icon: <Zap className="text-yellow-400 group-hover:text-yellow-300 transition-colors" size={24} />,
            title: "Performance",
            description: "Pushing the boundaries of what's possible with cutting-edge hardware optimization."
        },
        {
            icon: <Sparkles className="text-purple-400 group-hover:text-purple-300 transition-colors" size={24} />,
            title: "Aesthetics",
            description: "Believing that technology should be as beautiful as it is functional."
        },
        {
            icon: <Shield className="text-blue-400 group-hover:text-blue-300 transition-colors" size={24} />,
            title: "Quality",
            description: "Rigorous testing and premium materials ensure our devices stand the test of time."
        },
        {
            icon: <Globe className="text-green-400 group-hover:text-green-300 transition-colors" size={24} />,
            title: "Sustainability",
            description: "Committed to reducing e-waste through modular designs and recyclable packaging."
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* 1. Hero Section (Aurora Background) */}
            <AuroraBackground className="h-[60vh] md:h-[80vh] overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 flex flex-col items-center justify-center text-center px-4"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-purple-300 mb-6 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        Est. 2025
                    </div>
                    <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-6 leading-tight">
                        <span className="block text-white">We Are</span>
                        <span className="bg-gradient-to-r from-purple-400 via-white to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                            OWLS.
                        </span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-neutral-400 leading-relaxed font-light">
                        Crafting the intersection of high-performance computing and ethereal aesthetics for the modern creator.
                    </p>
                </motion.div>
            </AuroraBackground>

            {/* 2. Main Content (Standard Flow) */}
            <div className="relative z-10 bg-black pt-24 pb-24">
                <div className="container mx-auto px-4">

                    {/* Mission Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="mb-32 relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 md:p-16 backdrop-blur-xl shadow-2xl shadow-purple-900/10"
                    >
                        {/* Decorative background blurs */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-purple-500/20 blur-[100px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-blue-500/20 blur-[100px] pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col-reverse md:flex-row gap-16 items-center">
                            <div className="flex-1 space-y-8">
                                <h2 className="text-4xl md:text-5xl font-bold font-display text-white">Our Mission</h2>
                                <div className="space-y-6 text-lg text-neutral-300 leading-relaxed font-light">
                                    <p>
                                        At OWLS, we believe that personal technology has become staringly utilitarian. We exist to breathe soul back into the machines we use every day.
                                    </p>
                                    <p>
                                        We don't just build computers; we curate experiences. From the tactile feel of our mechanical keyboards to the silent power of our liquid-cooled workstations, every detail is obsessed over.
                                    </p>
                                </div>
                                <Button asChild size="lg" className="rounded-full h-12 px-8 bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-widest text-xs">
                                    <Link href="/products">
                                        Explore Our Work <ArrowRight size={16} className="ml-2" />
                                    </Link>
                                </Button>
                            </div>

                            {/* Orbit Visual */}
                            <div className="flex-1 w-full flex justify-center items-center">
                                <div className="relative w-80 h-80 flex items-center justify-center">
                                    {/* Central Core */}
                                    <div className="relative z-20 w-32 h-32 bg-black rounded-full border border-white/10 flex items-center justify-center shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)]">
                                        <Cpu size={48} className="text-white" />
                                    </div>

                                    {/* Rings */}
                                    <div className="absolute inset-0 border border-white/5 rounded-full"></div>
                                    <div className="absolute inset-12 border border-white/5 rounded-full"></div>
                                    <div className="absolute inset-24 border border-white/10 rounded-full border-dashed animate-[spin_60s_linear_infinite]"></div>

                                    {/* Orbiting Planet */}
                                    <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3 w-6 h-6 bg-purple-500 rounded-full blur-sm"></div>
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3 w-6 h-6 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Values Grid */}
                    <div className="mb-32">
                        <h2 className="text-3xl font-bold font-display text-center mb-16">Core Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {values.map((value, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="group p-10 rounded-[2rem] border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="mb-6 inline-flex p-4 rounded-2xl bg-black/40 border border-white/5 group-hover:border-white/20 transition-colors">
                                        {value.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors font-display">{value.title}</h3>
                                    <p className="text-neutral-400 text-lg leading-relaxed">{value.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / CTA */}
                    <div className="text-center border-t border-white/10 pt-12">
                        <p className="text-neutral-500 text-xs uppercase tracking-[0.3em] mb-4 flex items-center justify-center gap-2">
                            Designed & Engineered in Vietnam <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" />
                        </p>
                        <p className="text-neutral-600 text-sm">© 2025 OWLS Inc.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}