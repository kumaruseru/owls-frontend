'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2, Lock, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { B2BContactModal } from '@/components/modals/B2BContactModal';

export default function CartPage() {
    const { cart, isLoading, updatingItems, fetchCart, updateQuantity, removeFromCart, clearCart } = useCartStore();
    const { isAuthenticated, hasHydrated } = useAuthStore();

    const [couponCode, setCouponCode] = useState('');
    const [b2bModalOpen, setB2bModalOpen] = useState(false);
    const [b2bProduct, setB2bProduct] = useState<{ name: string, quantity: number } | null>(null);

    useEffect(() => {
        if (hasHydrated) {
            fetchCart();
        }
    }, [hasHydrated, fetchCart]);

    const handleUpdateQuantity = async (productId: string, newQuantity: number, productName: string = '') => {
        if (newQuantity > 5) {
            setB2bProduct({ name: productName, quantity: newQuantity });
            setB2bModalOpen(true);
            return;
        }

        try {
            await updateQuantity(productId, newQuantity);
        } catch (error: any) {
            toast.error(error.message || error.response?.data?.error || 'Failed to update');
        }
    };

    const handleRemove = async (productId: string) => {
        try {
            await removeFromCart(productId);
            toast.success('Removed form cart');
        } catch (error) {
            toast.error('Failed to remove');
        }
    };

    // Full screen loader only on initial fetch with no data
    if (isLoading && !cart) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            <B2BContactModal
                isOpen={b2bModalOpen}
                onClose={() => setB2bModalOpen(false)}
                productName={b2bProduct?.name}
                quantity={b2bProduct?.quantity}
            />

            {/* Fixed Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            {(!cart || cart.items.length === 0) ? (
                <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 animate-in fade-in zoom-in duration-500">
                    <div className="p-12 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl text-center max-w-md w-full shadow-2xl shadow-purple-900/10 hover:border-white/20 transition-colors">
                        <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-inner">
                            <ShoppingBag size={40} className="text-purple-300" />
                        </div>
                        <h1 className="text-4xl font-display font-bold mb-4 text-white tracking-tight">Your cart is empty</h1>
                        <p className="text-neutral-400 mb-10 leading-relaxed text-lg">
                            Looks like you haven&apos;t added anything yet. <br />
                            Explore our collection to find something you love.
                        </p>
                        <Button asChild size="xl" className="w-full h-14 rounded-2xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] transition-all hover:scale-105">
                            <Link href="/products">
                                Start Shopping <ArrowRight size={18} className="ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                    <div className="container mx-auto max-w-7xl">

                        {/* Page Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-white/10 gap-4">
                            <div>
                                <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter mb-2">Shopping Bag</h1>
                                <p className="text-neutral-400 text-lg">
                                    You have <span className="text-white font-bold">{cart.total_items} items</span> in your cart
                                </p>
                            </div>

                            <button
                                onClick={() => clearCart()}
                                className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5"
                            >
                                <Trash2 size={14} /> Clear Cart
                            </button>
                        </div>

                        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">

                            {/* Cart Items List */}
                            <div className="lg:col-span-8 space-y-6">
                                {cart.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group p-6 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col sm:flex-row gap-6 items-start sm:items-center relative transition-all duration-300 hover:bg-white/[0.08] hover:border-purple-500/30 hover:shadow-xl backdrop-blur-sm"
                                    >
                                        {/* Product Image */}
                                        <Link
                                            href={`/products/${item.product.slug}`}
                                            className="w-full sm:w-32 h-32 bg-black/40 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 relative group-hover:border-white/20 transition-colors"
                                        >
                                            {item.product.primary_image ? (
                                                <Image
                                                    src={item.product.primary_image}
                                                    alt={item.product.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 128px"
                                                    className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs uppercase tracking-widest">No Image</div>
                                            )}
                                        </Link>

                                        {/* Info & Controls */}
                                        <div className="flex-1 w-full flex flex-col sm:flex-row justify-between gap-6">

                                            {/* Title & Unit Price */}
                                            <div className="space-y-2 flex-1">
                                                <Link href={`/products/${item.product.slug}`}>
                                                    <h3 className="font-display font-bold text-xl text-white hover:text-purple-400 transition-colors line-clamp-2 leading-tight">
                                                        {item.product.name}
                                                    </h3>
                                                </Link>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-sm text-neutral-400 font-mono bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                                        {formatPrice(item.product.current_price)}
                                                    </p>
                                                    {item.product.sale_price && (
                                                        <span className="text-xs text-green-400 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">Sale</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quantity & Subtotal & Remove */}
                                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-6">

                                                {/* Subtotal */}
                                                <span className="font-bold text-xl text-white font-mono tracking-tight text-right order-2 sm:order-1">
                                                    {formatPrice(item.subtotal)}
                                                </span>

                                                <div className="flex items-center gap-4 order-1 sm:order-2">
                                                    {/* Quantity Control */}
                                                    <div className="flex items-center border border-white/10 bg-black/40 rounded-xl h-10 overflow-hidden shadow-inner">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1, item.product.name)}
                                                            disabled={item.quantity <= 1}
                                                            className="w-10 h-full flex items-center justify-center hover:bg-white/10 disabled:opacity-30 text-white transition-colors active:scale-90 transform duration-100"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-10 h-full flex items-center justify-center text-sm font-bold font-mono text-white border-x border-white/5 relative bg-white/5">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1, item.product.name)}
                                                            disabled={item.quantity >= item.product.stock}
                                                            className="w-10 h-full flex items-center justify-center hover:bg-white/10 disabled:opacity-30 text-white transition-colors active:scale-90 transform duration-100"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={() => handleRemove(item.product.id)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all group/trash"
                                                        title="Remove item"
                                                    >
                                                        <Trash2 size={18} className="group-hover/trash:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Sidebar */}
                            <div className="lg:col-span-4">
                                <div className="bg-white/5 border border-white/10 p-8 sticky top-32 rounded-[2.5rem] backdrop-blur-xl shadow-2xl shadow-purple-900/10">
                                    <h2 className="font-display font-bold text-2xl mb-8 text-white tracking-tight flex items-center gap-2">
                                        Order Summary
                                    </h2>

                                    <div className="space-y-6 mb-8">
                                        <div className="space-y-3 pt-2">
                                            <div className="flex justify-between text-sm text-neutral-400">
                                                <span>Subtotal</span>
                                                <span className="text-white font-mono">{formatPrice(cart.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-neutral-400">
                                                <span>Tax</span>
                                                <span className="text-white text-xs italic opacity-60">Calculated at checkout</span>
                                            </div>
                                        </div>

                                        {/* Coupon Input */}
                                        <div className="relative group">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                                            <div className="flex gap-2 h-12">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                    placeholder="Promo Code"
                                                    className="w-full h-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all font-mono uppercase tracking-wider"
                                                />
                                                <Button variant="outline" className="w-12 h-full rounded-xl border-white/10 hover:bg-white/10 hover:text-white shrink-0 p-0">
                                                    <ArrowRight size={18} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-end border-t border-white/10 pt-6 mb-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold uppercase tracking-widest text-neutral-400">Total</span>
                                            <span className="text-xs text-neutral-500 font-medium">Incl. VAT</span>
                                        </div>
                                        <span className="text-3xl font-bold font-display text-white tracking-tight">{formatPrice(cart.subtotal)}</span>
                                    </div>

                                    {/* Checkout Button */}
                                    <Button
                                        asChild
                                        size="xl"
                                        className="w-full h-16 rounded-2xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Link href={isAuthenticated ? "/checkout" : "/login"}>
                                            {isAuthenticated ? "Checkout Now" : "Login to Checkout"}
                                            <ArrowRight size={20} className="ml-2" />
                                        </Link>
                                    </Button>

                                    {/* Security Badge */}
                                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500 font-bold opacity-60 hover:opacity-100 transition-opacity cursor-help" title="Your transaction is encrypted">
                                        <Lock size={12} /> Secure SSL Encryption
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