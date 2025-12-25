'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import { AuroraBackground } from '@/components/ui/aurora-background';

export default function CartPage() {
    const { cart, isLoading, fetchCart, updateQuantity, removeFromCart, clearCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        fetchCart();
    }, []);

    const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
        try {
            await updateQuantity(productId, newQuantity);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update');
        }
    };

    const handleRemove = async (productId: number) => {
        try {
            await removeFromCart(productId);
            toast.success('Removed');
        } catch (error) {
            toast.error('Failed to remove');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-purple-500" />
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

            {(!cart || cart.items.length === 0) ? (
                <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4">
                    <div className="p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center max-w-md w-full shadow-2xl shadow-purple-900/10">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <ShoppingBag size={32} className="text-neutral-400" />
                        </div>
                        <h1 className="text-3xl font-display font-bold mb-3 text-white tracking-tight">Your cart is empty</h1>
                        <p className="text-neutral-400 mb-8 leading-relaxed">
                            Looks like you haven't added anything yet. <br />
                            Explore our collection to find something you love.
                        </p>
                        <Button asChild size="xl" className="w-full rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider">
                            <Link href="/products">
                                Start Shopping <ArrowRight size={18} className="ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                    <div className="container mx-auto max-w-6xl">

                        {/* Header */}
                        <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-6">
                            <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
                                Shopping Bag <span className="text-xl align-top text-neutral-500 font-mono font-normal">({cart.total_items})</span>
                            </h1>
                            <button
                                onClick={() => clearCart()}
                                className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-red-400 transition-colors"
                            >
                                Clear Cart
                            </button>
                        </div>

                        <div className="grid lg:grid-cols-12 gap-12">

                            {/* Cart Items */}
                            <div className="lg:col-span-8 space-y-4">
                                {cart.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group p-5 bg-white/5 border border-white/10 rounded-3xl flex gap-6 items-start relative transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 hover:shadow-lg backdrop-blur-sm"
                                    >
                                        {/* Image */}
                                        <Link
                                            href={`/products/${item.product.slug}`}
                                            className="w-24 h-24 md:w-32 md:h-32 bg-black/20 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 relative"
                                        >
                                            {item.product.primary_image ? (
                                                <Image
                                                    src={item.product.primary_image}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">No IMG</div>
                                            )}
                                        </Link>

                                        {/* Info & Actions */}
                                        <div className="flex-1 flex flex-col md:flex-row justify-between gap-4 py-1">
                                            <div className="space-y-1">
                                                <Link href={`/products/${item.product.slug}`}>
                                                    <h3 className="font-display font-bold text-lg md:text-xl text-white hover:text-purple-400 transition-colors line-clamp-2">
                                                        {item.product.name}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-neutral-400 font-mono">
                                                    Unit: {formatPrice(item.product.current_price)}
                                                </p>
                                            </div>

                                            {/* Quantity & Price Column */}
                                            <div className="flex flex-col items-start md:items-end gap-4 min-w-[140px]">
                                                <span className="font-bold text-lg text-white font-mono tracking-tight">
                                                    {formatPrice(item.subtotal)}
                                                </span>

                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center border border-white/10 bg-black/20 rounded-xl h-9 overflow-hidden">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="w-9 h-full flex items-center justify-center hover:bg-white/10 disabled:opacity-30 text-white transition-colors"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 h-full flex items-center justify-center text-sm font-bold font-mono text-white border-x border-white/5">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                                                            disabled={item.quantity >= item.product.stock}
                                                            className="w-9 h-full flex items-center justify-center hover:bg-white/10 disabled:opacity-30 text-white transition-colors"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemove(item.product.id)}
                                                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-neutral-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                                                        title="Remove item"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Sidebar */}
                            <div className="lg:col-span-4">
                                <div className="bg-white/5 border border-white/10 p-8 sticky top-32 rounded-3xl backdrop-blur-xl shadow-2xl shadow-purple-900/5">
                                    <h2 className="font-display font-bold text-2xl mb-8 text-white tracking-tight">Order Summary</h2>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between text-sm text-neutral-400">
                                            <span>Subtotal</span>
                                            <span className="text-white font-mono">{formatPrice(cart.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-neutral-400">
                                            <span>Shipping</span>
                                            <span className="text-white text-xs italic">Calculated at checkout</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-neutral-400">
                                            <span>Tax</span>
                                            <span className="text-white text-xs italic">Included</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end border-t border-white/10 pt-6 mb-8">
                                        <span className="text-sm font-bold uppercase tracking-widest text-white">Total</span>
                                        <span className="text-2xl font-bold font-mono text-purple-400">{formatPrice(cart.subtotal)}</span>
                                    </div>

                                    {isAuthenticated ? (
                                        <Button asChild size="xl" className="w-full h-14 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] transition-all">
                                            <Link href="/checkout">
                                                Checkout Now
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button asChild size="xl" variant="outline" className="w-full h-14 rounded-xl border-white/20 text-white hover:bg-white/10 font-bold uppercase tracking-wider text-sm">
                                            <Link href="/login">
                                                Login to Checkout
                                            </Link>
                                        </Button>
                                    )}

                                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                                        <Lock size={12} /> Secure Checkout
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}