'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button'; 

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    
    // Store hooks
    const { user, isAuthenticated } = useAuthStore();
    const { cart } = useCartStore();
    const cartItemCount = cart?.total_items || 0;

    // Handle Scroll Effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // --- CẬP NHẬT DANH SÁCH MENU TẠI ĐÂY ---
    const navLinks = [
        { href: '/products?category=laptop', label: 'Laptops' },
        { href: '/products?category=phone', label: 'Phones' },
        { href: '/products?category=audio', label: 'Audio' },
        { href: '/products?category=watch', label: 'Watches' },
        { href: '/about', label: 'About' },
    ];

    return (
        <>
            <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 md:pt-6 pointer-events-none">
                {/* Floating Capsule */}
                <motion.div 
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                        "pointer-events-auto flex items-center justify-between px-4 py-2 md:px-6 md:py-3 rounded-full border transition-all duration-500",
                        isScrolled
                            ? "bg-black/60 backdrop-blur-xl border-white/10 w-[92%] md:w-[750px] shadow-2xl shadow-purple-900/10" // Tăng độ rộng lên 750px để chứa đủ menu
                            : "bg-transparent border-transparent w-[95%] md:w-[900px] translate-y-0" 
                    )}
                >
                    {/* 1. Left: Hamburger (Mobile) & Logo */}
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden text-white/80 hover:text-white transition-colors"
                        >
                            <Menu size={20} />
                        </button>

                        <Link href="/" className="font-display font-black text-xl tracking-tighter text-white flex items-center gap-2">
                            OWLS<span className="text-purple-500">.</span>
                        </Link>
                    </div>

                    {/* 2. Center: Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.href} 
                                href={link.href}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300",
                                    pathname === link.href 
                                        ? "bg-white/10 text-white" 
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* 3. Right: Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Search Trigger */}
                        <button className="p-2 text-white/60 hover:text-white transition-colors hover:bg-white/5 rounded-full hidden sm:block">
                            <Search size={18} />
                        </button>

                        {/* Account */}
                        <Link 
                            href={isAuthenticated ? "/account" : "/login"} 
                            className="p-2 text-white/60 hover:text-white transition-colors hover:bg-white/5 rounded-full"
                        >
                            <User size={18} />
                        </Link>

                        {/* Cart */}
                        <Link 
                            href="/cart" 
                            className="relative p-2 text-white/60 hover:text-white transition-colors hover:bg-white/5 rounded-full group"
                        >
                            <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
                            {cartItemCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                </span>
                            )}
                        </Link>
                    </div>
                </motion.div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute left-0 top-0 bottom-0 w-[80%] max-w-sm bg-neutral-900 border-r border-white/10 p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-10">
                                <span className="font-display font-black text-2xl text-white">OWLS.</span>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <nav className="flex flex-col gap-6">
                                {navLinks.map((link, idx) => (
                                    <Link 
                                        key={link.href}
                                        href={link.href}
                                        className="text-2xl font-light text-white/80 hover:text-purple-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-auto pt-10 border-t border-white/10 absolute bottom-10 left-6 right-6">
                                <Button className="w-full bg-white text-black hover:bg-neutral-200" asChild>
                                    <Link href={isAuthenticated ? "/account" : "/login"}>
                                        {isAuthenticated ? "My Account" : "Sign In"}
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}