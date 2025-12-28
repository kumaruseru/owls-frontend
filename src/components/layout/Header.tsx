'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const { user, isAuthenticated, hasHydrated } = useAuthStore();
    const { cart } = useCartStore();
    const cartItemCount = cart?.total_items || 0;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname, searchParams]);

    const isAdminRoute = pathname?.startsWith('/admin');

    const customerLinks = [
        { href: '/products?category=laptops', label: 'Laptops' },
        { href: '/products?category=phones', label: 'Phones' },
        { href: '/products?category=audio', label: 'Audio' },
        { href: '/products?category=watches', label: 'Watches' },
        { href: '/about', label: 'About' },
        ...(hasHydrated && user?.is_staff ? [{ href: '/admin', label: 'Dashboard' }] : []),
    ];

    const adminLinks = [
        { href: '/admin', label: 'Overview' },
        { href: '/admin/orders', label: 'Orders' },
        { href: '/admin/products', label: 'Products' },
        { href: '/admin/customers', label: 'Customers' },
        { href: '/admin/settings', label: 'Settings' },
        { href: '/', label: 'Exit Admin' },
    ];

    const navLinks = (hasHydrated && isAuthenticated && user?.is_staff && isAdminRoute) ? adminLinks : customerLinks;

    const isActiveLink = (href: string) => {
        if (href === '/') return pathname === '/';
        if (currentPath === href) return true;

        if (!href.includes('?')) {
            if (href === '/admin') return pathname === '/admin';

            if (pathname.startsWith(href)) {
                const nextChar = pathname[href.length];
                return !nextChar || nextChar === '/';
            }
        }
        return false;
    };

    return (
        <>
            <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 md:pt-6 pointer-events-none">
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                        "pointer-events-auto flex items-center justify-between px-3 py-2 md:px-4 md:py-2.5 rounded-full border transition-all duration-500",
                        // Điều chỉnh chiều rộng tối đa (max-w) để không bị tràn màn hình
                        isScrolled
                            ? "bg-black/40 backdrop-blur-2xl border-white/10 w-[92%] max-w-5xl shadow-2xl shadow-purple-900/10"
                            : "bg-black/20 border-white/5 w-[95%] max-w-6xl backdrop-blur-md"
                    )}
                >
                    {/* Left: Logo & Mobile Toggle */}
                    <div className="flex items-center gap-3 md:gap-4 pr-2 md:pr-6 pl-2 shrink-0">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden text-white/80 hover:text-white transition-colors"
                        >
                            <Menu size={20} />
                        </button>

                        <Link href="/" className="font-display font-black text-xl tracking-tighter text-white flex items-center gap-1 shrink-0">
                            OWLS<span className="text-purple-500 text-2xl leading-none mb-1">.</span>
                        </Link>
                    </div>

                    {/* Center: Desktop Nav (Scrollable if needed) */}
                    <nav className="hidden lg:flex items-center bg-white/5 rounded-full p-1 border border-white/5 overflow-x-auto no-scrollbar max-w-[600px]">
                        {navLinks.map((link) => {
                            const isActive = isActiveLink(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-300 z-10 whitespace-nowrap",
                                        isActive ? "text-white" : "text-white/60 hover:text-white/80"
                                    )}
                                >
                                    {isActive && (
                                        <motion.span
                                            layoutId="active-pill"
                                            className="absolute inset-0 bg-white/15 rounded-full -z-10 shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] backdrop-blur-sm border border-white/10"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 md:gap-2 pl-2 md:pl-6 shrink-0">
                        <button className="p-2.5 text-white/60 hover:text-white transition-colors hover:bg-white/10 rounded-full hidden sm:block">
                            <Search size={18} />
                        </button>

                        <Link
                            href={isAuthenticated ? "/account" : "/login"}
                            className="p-2.5 text-white/60 hover:text-white transition-colors hover:bg-white/10 rounded-full flex items-center justify-center"
                        >
                            {!hasHydrated ? (
                                <div className="w-[18px] h-[18px] rounded-full bg-white/10 animate-pulse" />
                            ) : (
                                <User size={18} />
                            )}
                        </Link>

                        <Link
                            href="/cart"
                            className="relative p-2.5 text-white/60 hover:text-white transition-colors hover:bg-white/10 rounded-full group"
                        >
                            <ShoppingBag size={18} className="group-hover:scale-110 transition-transform duration-300" />
                            {cartItemCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500 border border-black"></span>
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
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xl lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute left-0 top-0 bottom-0 w-[80%] max-w-sm bg-black/90 border-r border-white/10 p-6 shadow-2xl"
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
                                {navLinks.map((link) => {
                                    const isActive = isActiveLink(link.href);
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                "text-2xl font-light transition-all duration-300 flex items-center gap-3",
                                                isActive ? "text-purple-400 font-medium pl-4 border-l-2 border-purple-400" : "text-white/60 hover:text-white"
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="mt-auto pt-10 border-t border-white/10 absolute bottom-10 left-6 right-6">
                                {!hasHydrated ? (
                                    <div className="w-full h-12 bg-white/10 rounded-xl animate-pulse" />
                                ) : (
                                    <Button className="w-full bg-white text-black hover:bg-neutral-200 rounded-xl h-12 text-lg font-bold" asChild>
                                        <Link href={isAuthenticated ? "/account" : "/login"}>
                                            {isAuthenticated ? "My Account" : "Sign In"}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
