'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, CreditCard, Wallet, Loader2, ArrowLeft, Check, Truck, Banknote, ShieldCheck, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { cn, formatPrice } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuroraBackground } from '@/components/ui/aurora-background';

const checkoutSchema = z.object({
    recipient_name: z.string().min(1, 'Recipient name is required'),
    phone: z.string().min(10, 'Invalid phone number'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    district: z.string().min(1, 'District is required'),
    ward: z.string().min(1, 'Ward is required'),
    note: z.string().optional(),
    payment_method: z.string().min(1, 'Please select a payment method'),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: Banknote, description: 'Pay with cash upon delivery.', color: 'green' },
    { id: 'vnpay', name: 'VNPay', icon: CreditCard, description: 'Scan QR code with VNPay app.', color: 'blue' },
    { id: 'momo', name: 'MoMo', icon: Wallet, description: 'Pay via MoMo E-Wallet.', color: 'pink' },
];

export default function CheckoutPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { cart, fetchCart } = useCartStore();
    const { user, isAuthenticated } = useAuthStore();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CheckoutForm>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            payment_method: 'cod',
        },
    });

    const selectedPayment = watch('payment_method');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/checkout');
            return;
        }
        fetchCart();

        // Pre-fill from user profile
        if (user) {
            setValue('recipient_name', user.full_name || '');
            setValue('phone', user.phone || '');
            setValue('address', user.address || '');
            setValue('city', user.city || '');
            setValue('district', user.district || '');
            setValue('ward', user.ward || '');
        }
    }, [isAuthenticated, user]);

    const onSubmit = async (data: CheckoutForm) => {
        setIsSubmitting(true);
        try {
            const response = await api.post('/orders/checkout/', data);
            toast.success('Order placed successfully!');

            // If payment method requires redirect
            if (data.payment_method !== 'cod' && response.data.payment_url) {
                window.location.href = response.data.payment_url;
            } else {
                router.push(`/orders/${response.data.order.order_number}?success=true`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Checkout failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (!cart) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-purple-500" />
            </div>
        );
    }

    // Empty cart state
    if (cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
                {/* Fixed Background */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <AuroraBackground className="h-full w-full">
                        <></>
                    </AuroraBackground>
                </div>

                <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4">
                    <div className="p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center max-w-md w-full shadow-2xl shadow-purple-900/10">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <Package size={32} className="text-neutral-400" />
                        </div>
                        <h1 className="text-3xl font-display font-bold mb-3 text-white tracking-tight">Your cart is empty</h1>
                        <p className="text-neutral-400 mb-8 leading-relaxed">
                            Add some products to your cart before checking out.
                        </p>
                        <Button asChild size="xl" className="w-full rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider">
                            <Link href="/products">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
                            </Link>
                        </Button>
                    </div>
                </div>
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

            {/* Content */}
            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-6xl">

                    {/* Back Link */}
                    <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors mb-8 group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Cart
                    </Link>

                    {/* Header */}
                    <div className="flex items-end justify-between mb-10 border-b border-white/10 pb-6">
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
                            Checkout
                        </h1>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-400">
                            <ShieldCheck size={16} /> Secure
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid lg:grid-cols-3 gap-12">

                            {/* Left Column: Information */}
                            <div className="lg:col-span-2 space-y-8">

                                {/* Shipping Info */}
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                            <MapPin className="text-purple-400" size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">Shipping Address</h2>
                                            <p className="text-xs text-neutral-500">Where should we deliver your order?</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Full Name *</label>
                                            <Input
                                                {...register('recipient_name')}
                                                placeholder="John Doe"
                                                className="h-12 bg-black/30 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:ring-0"
                                            />
                                            {errors.recipient_name && <p className="text-red-400 text-xs ml-1">{errors.recipient_name.message}</p>}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Phone Number *</label>
                                            <Input
                                                {...register('phone')}
                                                placeholder="09..."
                                                className="h-12 bg-black/30 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:ring-0"
                                            />
                                            {errors.phone && <p className="text-red-400 text-xs ml-1">{errors.phone.message}</p>}
                                        </div>

                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Street Address *</label>
                                            <Input
                                                {...register('address')}
                                                placeholder="Street address, apartment, suite, unit, etc."
                                                className="h-12 bg-black/30 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:ring-0"
                                            />
                                            {errors.address && <p className="text-red-400 text-xs ml-1">{errors.address.message}</p>}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">City/Province *</label>
                                            <Input
                                                {...register('city')}
                                                placeholder="City"
                                                className="h-12 bg-black/30 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:ring-0"
                                            />
                                            {errors.city && <p className="text-red-400 text-xs ml-1">{errors.city.message}</p>}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">District *</label>
                                            <Input
                                                {...register('district')}
                                                placeholder="District"
                                                className="h-12 bg-black/30 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:ring-0"
                                            />
                                            {errors.district && <p className="text-red-400 text-xs ml-1">{errors.district.message}</p>}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Ward *</label>
                                            <Input
                                                {...register('ward')}
                                                placeholder="Ward"
                                                className="h-12 bg-black/30 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:ring-0"
                                            />
                                            {errors.ward && <p className="text-red-400 text-xs ml-1">{errors.ward.message}</p>}
                                        </div>

                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Order Notes (Optional)</label>
                                            <textarea
                                                {...register('note')}
                                                rows={3}
                                                placeholder="Notes about your order, e.g. special notes for delivery."
                                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:ring-0 resize-none outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                            <CreditCard className="text-blue-400" size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">Payment Method</h2>
                                            <p className="text-xs text-neutral-500">Choose how you'd like to pay</p>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-4">
                                        {paymentMethods.map((method) => (
                                            <label
                                                key={method.id}
                                                className={cn(
                                                    "flex flex-col items-center p-5 border rounded-2xl cursor-pointer transition-all duration-300 group text-center",
                                                    selectedPayment === method.id
                                                        ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                                                        : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5"
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    value={method.id}
                                                    {...register('payment_method')}
                                                    className="hidden"
                                                />

                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all",
                                                    selectedPayment === method.id
                                                        ? "bg-purple-500 text-white scale-110"
                                                        : "bg-white/10 text-neutral-400 group-hover:bg-white/15"
                                                )}>
                                                    <method.icon size={24} />
                                                </div>

                                                <p className={cn(
                                                    "font-bold text-sm mb-1 transition-colors",
                                                    selectedPayment === method.id ? "text-white" : "text-neutral-300"
                                                )}>
                                                    {method.name}
                                                </p>
                                                <p className="text-[10px] text-neutral-500 leading-relaxed">
                                                    {method.description}
                                                </p>

                                                {selectedPayment === method.id && (
                                                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                                        <Check size={12} className="text-white" />
                                                    </div>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                    {errors.payment_method && <p className="text-red-400 text-xs mt-3 ml-1">{errors.payment_method.message}</p>}
                                </div>
                            </div>

                            {/* Right Column: Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sticky top-32 backdrop-blur-xl shadow-2xl shadow-purple-900/5">
                                    <h2 className="text-xl font-bold font-display text-white mb-6">Order Summary</h2>

                                    {/* Mini Cart Items */}
                                    <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {cart.items.map((item) => (
                                            <div key={item.id} className="flex gap-4 group">
                                                <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex-shrink-0 relative">
                                                    {item.product.primary_image ? (
                                                        <Image
                                                            src={item.product.primary_image}
                                                            alt={item.product.name}
                                                            fill
                                                            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[10px]">IMG</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                                                    <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="text-sm font-mono text-neutral-300 self-center">
                                                    {formatPrice(item.subtotal)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-white/10 text-sm">
                                        <div className="flex justify-between text-neutral-400">
                                            <span>Subtotal</span>
                                            <span className="text-white font-mono">{formatPrice(cart.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-neutral-400">
                                            <span>Shipping</span>
                                            <span className="text-green-400 font-mono text-xs">Free</span>
                                        </div>
                                        <div className="flex justify-between text-neutral-400">
                                            <span>Tax</span>
                                            <span className="text-white font-mono text-xs">Included</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end border-t border-white/10 pt-6 mt-6 mb-8">
                                        <span className="text-sm font-bold uppercase tracking-widest text-white">Total</span>
                                        <span className="text-2xl font-mono font-bold text-purple-400">{formatPrice(cart.subtotal)}</span>
                                    </div>

                                    <Button
                                        type="submit"
                                        size="xl"
                                        className="w-full h-14 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] transition-all"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Place Order'
                                        )}
                                    </Button>

                                    <p className="text-[10px] text-neutral-500 text-center mt-4 flex items-center justify-center gap-1.5">
                                        <Check size={12} className="text-green-500" /> Secure & Encrypted Checkout
                                    </p>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}