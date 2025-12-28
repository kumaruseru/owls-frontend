'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, CreditCard, Wallet, Loader2, ArrowLeft, Check, Truck, Banknote, ShieldCheck, Package, ChevronDown } from 'lucide-react';
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

// GHN Address types
interface GHNProvince {
    ProvinceID: number;
    ProvinceName: string;
}

interface GHNDistrict {
    DistrictID: number;
    DistrictName: string;
}

interface GHNWard {
    WardCode: string;
    WardName: string;
}

const checkoutSchema = z.object({
    recipient_name: z.string().min(1, 'Vui lòng nhập tên người nhận'),
    phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
    address: z.string().min(1, 'Vui lòng nhập địa chỉ'),
    city: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
    district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
    ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
    note: z.string().optional(),
    payment_method: z.string().min(1, 'Vui lòng chọn phương thức thanh toán'),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const paymentMethods = [
    { id: 'cod', name: 'Thanh toán khi nhận hàng', icon: Banknote, description: 'Thanh toán bằng tiền mặt khi nhận hàng.', color: 'green' },
    { id: 'vnpay', name: 'VNPay', icon: CreditCard, description: 'Quét mã QR bằng ứng dụng VNPay.', color: 'blue' },
    { id: 'momo', name: 'MoMo', icon: Wallet, description: 'Thanh toán qua ví MoMo.', color: 'pink' },
];

const isCheckoutSubmitting = { current: false }; // Module-level lock

export default function CheckoutPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { cart, fetchCart } = useCartStore();
    const { user, isAuthenticated, hasHydrated } = useAuthStore();

    // Reset lock on mount/unmount to be safe against spa navigation
    useEffect(() => {
        isCheckoutSubmitting.current = false;
        return () => {
            isCheckoutSubmitting.current = false;
        };
    }, []);

    // GHN Address State - 3 levels
    const [provinces, setProvinces] = useState<GHNProvince[]>([]);
    const [districts, setDistricts] = useState<GHNDistrict[]>([]);
    const [wards, setWards] = useState<GHNWard[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
    const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [isLoadingWards, setIsLoadingWards] = useState(false);

    // Shipping Fee State
    const [shippingFee, setShippingFee] = useState<number | null>(null);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

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

    // Fetch provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            setIsLoadingProvinces(true);
            try {
                const response = await api.get('/shipping/ghn/provinces/');
                setProvinces(response.data || []);
            } catch (error) {
                console.error('Failed to fetch provinces:', error);
            } finally {
                setIsLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch districts when province changes
    useEffect(() => {
        if (!selectedProvinceId) {
            setDistricts([]);
            setWards([]);
            setShippingFee(null);
            return;
        }

        const fetchDistricts = async () => {
            setIsLoadingDistricts(true);
            try {
                const response = await api.get(`/shipping/ghn/districts/${selectedProvinceId}/`);
                setDistricts(response.data || []);
            } catch (error) {
                console.error('Failed to fetch districts:', error);
            } finally {
                setIsLoadingDistricts(false);
            }
        };
        fetchDistricts();
    }, [selectedProvinceId]);

    // Fetch wards when district changes
    useEffect(() => {
        if (!selectedDistrictId) {
            setWards([]);
            setShippingFee(null);
            return;
        }

        const fetchWards = async () => {
            setIsLoadingWards(true);
            try {
                const response = await api.get(`/shipping/ghn/wards/${selectedDistrictId}/`);
                setWards(response.data || []);
            } catch (error) {
                console.error('Failed to fetch wards:', error);
            } finally {
                setIsLoadingWards(false);
            }
        };
        fetchWards();
    }, [selectedDistrictId]);

    // Calculate shipping fee when ward is selected
    const calculateShippingFee = useCallback(async () => {
        if (!selectedDistrictId || !selectedWardCode || !cart || cart.items.length === 0) {
            setShippingFee(null);
            return;
        }

        setIsCalculatingShipping(true);
        try {
            // Calculate total weight (500g per item), minimum 100g for GHN API
            const totalWeight = Math.max(100, cart.items.reduce((acc, item) => acc + (item.quantity * 500), 0));

            const response = await api.post('/shipping/ghn/calculate-fee/', {
                to_district_id: selectedDistrictId,
                to_ward_code: selectedWardCode,
                weight: totalWeight,
                // No insurance_value - to match GHN displayed service fee
            });

            if (response.data.success) {
                setShippingFee(response.data.total_fee);
            } else {
                console.error('GHN error:', response.data.error);
                toast.error(`Phí ship: ${response.data.error || 'Không thể tính'}`);
                setShippingFee(30000);
            }
        } catch (error: any) {
            console.error('Failed to calculate shipping fee:', error);
            const errorMsg = error.response?.data?.error || 'Không thể tính phí ship';
            toast.error(errorMsg);
            setShippingFee(30000);
        } finally {
            setIsCalculatingShipping(false);
        }
    }, [selectedDistrictId, selectedWardCode, cart]);

    useEffect(() => {
        calculateShippingFee();
    }, [calculateShippingFee]);

    // Auth check and cart fetch
    useEffect(() => {
        // Wait for Zustand store to rehydrate from localStorage before checking auth
        if (!hasHydrated) return;

        if (!isAuthenticated) {
            router.push('/login?redirect=/checkout');
            return;
        }
        fetchCart();
    }, [isAuthenticated, hasHydrated]);

    // Pre-fill form when user data changes
    useEffect(() => {
        if (user) {
            setValue('recipient_name', user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || '');
            setValue('phone', user.phone || '');
            setValue('address', user.address || '');
            setValue('city', user.city || '');
            setValue('district', user.district || '');
            setValue('ward', user.ward || '');

            // Auto-populate GHN dropdowns from saved user IDs
            if (user.province_id) {
                setSelectedProvinceId(user.province_id);
            }
            if (user.district_id) {
                setSelectedDistrictId(user.district_id);
            }
            if (user.ward_code) {
                setSelectedWardCode(user.ward_code);
            }
        }
    }, [user, setValue]);

    // Handle province selection
    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceId = parseInt(e.target.value);
        const province = provinces.find(p => p.ProvinceID === provinceId);
        setSelectedProvinceId(provinceId || null);
        setSelectedDistrictId(null);
        setSelectedWardCode(null);
        setValue('city', province?.ProvinceName || '');
        setValue('district', '');
        setValue('ward', '');
    };

    // Handle district selection
    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtId = parseInt(e.target.value);
        const district = districts.find(d => d.DistrictID === districtId);
        setSelectedDistrictId(districtId || null);
        setSelectedWardCode(null);
        setValue('district', district?.DistrictName || '');
        setValue('ward', '');
    };

    // Handle ward selection
    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const wardCode = e.target.value;
        const ward = wards.find(w => w.WardCode === wardCode);
        setSelectedWardCode(wardCode || null);
        setValue('ward', ward?.WardName || '');
    };

    const onSubmit = async (data: CheckoutForm) => {
        if (isCheckoutSubmitting.current) return;
        isCheckoutSubmitting.current = true;
        setIsSubmitting(true);

        try {
            const payload = {
                ...data,
                shipping_fee: shippingFee || 0,
                to_district_id: selectedDistrictId,
                to_ward_code: selectedWardCode,
            };

            const response = await api.post('/checkout/', payload);
            toast.success('Đặt hàng thành công!');

            if (data.payment_method !== 'cod' && response.data.payment_url) {
                // Redirect in the same tab as requested
                window.location.href = response.data.payment_url;
            } else {
                router.push(`/checkout/success?order_number=${response.data.order_number}`);
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            console.error('Error response data:', error.response?.data);

            // Parse error message from various response formats
            let errorMessage = 'Đặt hàng thất bại';
            const errorData = error.response?.data;

            if (errorData) {
                if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.errors) {
                    // Array of errors
                    errorMessage = Array.isArray(errorData.errors)
                        ? errorData.errors.join(', ')
                        : JSON.stringify(errorData.errors);
                } else {
                    // Serializer field errors - format: { field: ["error1", "error2"] }
                    const messages: string[] = [];
                    Object.entries(errorData).forEach(([field, errors]) => {
                        if (Array.isArray(errors)) {
                            messages.push(`${field}: ${errors.join(', ')}`);
                        } else if (typeof errors === 'string') {
                            messages.push(`${field}: ${errors}`);
                        }
                    });
                    if (messages.length > 0) {
                        errorMessage = messages.join('; ');
                    }
                }
            }

            toast.error(errorMessage);

            // Redirect to failed page for payment gateway errors
            if (data.payment_method !== 'cod') {
                router.push(`/checkout/failed?reason=${encodeURIComponent(errorMessage)}`);
            }

            isCheckoutSubmitting.current = false; // Release lock on error only
            setIsSubmitting(false);
        }
        // Note: We don't release lock on success to prevent double submission during redirect
    };

    const total = cart ? cart.subtotal + (shippingFee || 0) : 0;

    if (!cart) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-purple-500" />
            </div>
        );
    }

    if (cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <AuroraBackground className="h-full w-full"><></></AuroraBackground>
                </div>
                <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4">
                    <div className="p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center max-w-md w-full shadow-2xl shadow-purple-900/10">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <Package size={32} className="text-neutral-400" />
                        </div>
                        <h1 className="text-3xl font-display font-bold mb-3 text-white tracking-tight">Giỏ hàng trống</h1>
                        <p className="text-neutral-400 mb-8 leading-relaxed">
                            Thêm sản phẩm vào giỏ hàng trước khi thanh toán.
                        </p>
                        <Button asChild size="xl" className="w-full rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider">
                            <Link href="/products">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Tiếp tục mua sắm
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full"><></></AuroraBackground>
            </div>

            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-6xl">

                    <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors mb-8 group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Quay lại giỏ hàng
                    </Link>

                    <div className="flex items-end justify-between mb-10 border-b border-white/10 pb-6">
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
                            Thanh toán
                        </h1>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-400">
                            <ShieldCheck size={16} /> Bảo mật
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid lg:grid-cols-3 gap-12">

                            <div className="lg:col-span-2 space-y-8">

                                {/* Shipping Info */}
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                            <MapPin className="text-purple-400" size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">Địa chỉ giao hàng</h2>
                                            <p className="text-xs text-neutral-500">Bạn muốn nhận hàng ở đâu?</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Họ và tên *</label>
                                            <Input
                                                {...register('recipient_name')}
                                                placeholder="Nguyễn Văn A"
                                                className="h-12 bg-black/30 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:ring-0"
                                            />
                                            {errors.recipient_name && <p className="text-red-400 text-xs ml-1">{errors.recipient_name.message}</p>}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Số điện thoại *</label>
                                            <Input
                                                {...register('phone')}
                                                placeholder="0912 345 678"
                                                className="h-12 bg-black/30 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:ring-0"
                                            />
                                            {errors.phone && <p className="text-red-400 text-xs ml-1">{errors.phone.message}</p>}
                                        </div>

                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Địa chỉ chi tiết *</label>
                                            <Input
                                                {...register('address')}
                                                placeholder="Số nhà, tên đường, tòa nhà..."
                                                className="h-12 bg-black/30 border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:ring-0"
                                            />
                                            {errors.address && <p className="text-red-400 text-xs ml-1">{errors.address.message}</p>}
                                        </div>

                                        {/* Province Dropdown */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Tỉnh / Thành phố *</label>
                                            <div className="relative">
                                                <select
                                                    onChange={handleProvinceChange}
                                                    value={selectedProvinceId || ''}
                                                    className="w-full h-12 bg-black/30 border border-white/10 rounded-xl text-white px-4 pr-10 appearance-none focus:border-purple-500/50 focus:ring-0 outline-none"
                                                    disabled={isLoadingProvinces}
                                                >
                                                    <option value="">Chọn tỉnh/thành phố</option>
                                                    {provinces.map((province) => (
                                                        <option key={province.ProvinceID} value={province.ProvinceID} className="bg-neutral-900">
                                                            {province.ProvinceName}
                                                        </option>
                                                    ))}
                                                </select>
                                                {isLoadingProvinces ? (
                                                    <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-500" />
                                                ) : (
                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                                )}
                                            </div>
                                            {errors.city && <p className="text-red-400 text-xs ml-1">{errors.city.message}</p>}
                                            <input type="hidden" {...register('city')} />
                                        </div>

                                        {/* District Dropdown */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Quận / Huyện *</label>
                                            <div className="relative">
                                                <select
                                                    onChange={handleDistrictChange}
                                                    value={selectedDistrictId || ''}
                                                    className="w-full h-12 bg-black/30 border border-white/10 rounded-xl text-white px-4 pr-10 appearance-none focus:border-purple-500/50 focus:ring-0 outline-none disabled:opacity-50"
                                                    disabled={!selectedProvinceId || isLoadingDistricts}
                                                >
                                                    <option value="">Chọn quận/huyện</option>
                                                    {districts.map((district) => (
                                                        <option key={district.DistrictID} value={district.DistrictID} className="bg-neutral-900">
                                                            {district.DistrictName}
                                                        </option>
                                                    ))}
                                                </select>
                                                {isLoadingDistricts ? (
                                                    <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-500" />
                                                ) : (
                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                                )}
                                            </div>
                                            {errors.district && <p className="text-red-400 text-xs ml-1">{errors.district.message}</p>}
                                            <input type="hidden" {...register('district')} />
                                        </div>

                                        {/* Ward Dropdown */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Phường / Xã *</label>
                                            <div className="relative">
                                                <select
                                                    onChange={handleWardChange}
                                                    value={selectedWardCode || ''}
                                                    className="w-full h-12 bg-black/30 border border-white/10 rounded-xl text-white px-4 pr-10 appearance-none focus:border-purple-500/50 focus:ring-0 outline-none disabled:opacity-50"
                                                    disabled={!selectedDistrictId || isLoadingWards}
                                                >
                                                    <option value="">Chọn phường/xã</option>
                                                    {wards.map((ward) => (
                                                        <option key={ward.WardCode} value={ward.WardCode} className="bg-neutral-900">
                                                            {ward.WardName}
                                                        </option>
                                                    ))}
                                                </select>
                                                {isLoadingWards ? (
                                                    <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-500" />
                                                ) : (
                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                                )}
                                            </div>
                                            {errors.ward && <p className="text-red-400 text-xs ml-1">{errors.ward.message}</p>}
                                            <input type="hidden" {...register('ward')} />
                                        </div>

                                        {/* Shipping Fee Display */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Phí vận chuyển</label>
                                            <div className="h-12 bg-black/30 border border-white/10 rounded-xl px-4 flex items-center">
                                                {isCalculatingShipping ? (
                                                    <div className="flex items-center gap-2 text-neutral-400">
                                                        <Loader2 size={16} className="animate-spin" />
                                                        <span className="text-sm">Đang tính...</span>
                                                    </div>
                                                ) : shippingFee !== null ? (
                                                    <div className="flex items-center gap-2">
                                                        <Truck size={16} className="text-green-400" />
                                                        <span className="text-green-400 font-mono font-bold">{formatPrice(shippingFee)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-500 text-sm">Chọn địa chỉ để tính phí</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Ghi chú đơn hàng (Tùy chọn)</label>
                                            <textarea
                                                {...register('note')}
                                                rows={3}
                                                placeholder="Ghi chú về đơn hàng, ví dụ: giao hàng giờ hành chính..."
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
                                            <h2 className="text-lg font-bold text-white">Phương thức thanh toán</h2>
                                            <p className="text-xs text-neutral-500">Chọn cách bạn muốn thanh toán</p>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-3 gap-4">
                                        {paymentMethods.map((method) => (
                                            <label
                                                key={method.id}
                                                className={cn(
                                                    "flex flex-col items-center p-5 border rounded-2xl cursor-pointer transition-all duration-300 group text-center relative",
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
                                    <h2 className="text-xl font-bold font-display text-white mb-6">Đơn hàng của bạn</h2>

                                    <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {cart.items.map((item) => (
                                            <div key={item.id} className="flex gap-4 group">
                                                <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex-shrink-0 relative">
                                                    {item.product.primary_image ? (
                                                        <Image
                                                            src={item.product.primary_image}
                                                            alt={item.product.name}
                                                            fill
                                                            sizes="64px"
                                                            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[10px]">IMG</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                                                    <p className="text-xs text-neutral-500">SL: {item.quantity}</p>
                                                </div>
                                                <div className="text-sm font-mono text-neutral-300 self-center">
                                                    {formatPrice(item.subtotal)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-white/10 text-sm">
                                        <div className="flex justify-between text-neutral-400">
                                            <span>Tạm tính</span>
                                            <span className="text-white font-mono">{formatPrice(cart.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-neutral-400">
                                            <span className="flex items-center gap-2">
                                                Phí vận chuyển
                                                {isCalculatingShipping && <Loader2 size={12} className="animate-spin" />}
                                            </span>
                                            {shippingFee !== null ? (
                                                <span className="text-green-400 font-mono">{formatPrice(shippingFee)}</span>
                                            ) : (
                                                <span className="text-neutral-500 text-xs italic">Chọn địa chỉ</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end border-t border-white/10 pt-6 mt-6 mb-8">
                                        <span className="text-sm font-bold uppercase tracking-widest text-white">Tổng cộng</span>
                                        <span className="text-2xl font-mono font-bold text-purple-400">{formatPrice(total)}</span>
                                    </div>

                                    <Button
                                        type="submit"
                                        size="xl"
                                        className="w-full h-14 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] transition-all"
                                        disabled={isSubmitting || shippingFee === null}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin mr-2" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            'Đặt hàng'
                                        )}
                                    </Button>

                                    {shippingFee === null && (
                                        <p className="text-[10px] text-yellow-400/70 text-center mt-3">
                                            Vui lòng chọn địa chỉ để tính phí vận chuyển
                                        </p>
                                    )}

                                    <p className="text-[10px] text-neutral-500 text-center mt-4 flex items-center justify-center gap-1.5">
                                        <Check size={12} className="text-green-500" /> Thanh toán an toàn & bảo mật
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
