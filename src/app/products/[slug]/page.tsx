'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, Minus, Plus, Truck, Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import api from '@/lib/api';
import { useCartStore } from '@/store/cart-store';
import { cn, formatPrice } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { B2BContactModal } from '@/components/modals/B2BContactModal';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    sale_price: number | null;
    current_price: number;
    discount_percent: number;
    primary_image: string | null;
    images: { id: number; image: string; is_primary: boolean }[];
    category: { id: number; name: string; slug: string };
    stock: number;
    is_in_stock: boolean;
    average_rating: number;
    review_count: number;
    attributes: Record<string, string>;
}

interface Review {
    id: number;
    user_name: string;
    user_avatar: string | null;
    rating: number;
    comment: string;
    created_at: string;
}

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params?.slug as string | undefined;

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
    const [showB2BModal, setShowB2BModal] = useState(false);

    const { addToCart, isLoading: cartLoading } = useCartStore();

    useEffect(() => {
        if (!slug) return;

        let isMounted = true;

        const fetchData = async () => {
            setIsLoading(true);
            setProduct(null);
            setSelectedImage(null);

            console.log('Fetching product details for slug:', slug);
            if (slug === 'undefined') {
                console.error('Invalid slug: undefined');
                setIsLoading(false);
                return;
            }

            try {
                const [productRes, reviewsRes] = await Promise.all([
                    api.get(`/catalog/products/${slug}/`),
                    api.get(`/social/products/${slug}/reviews/`).catch(() => ({ data: [] }))
                ]);

                if (isMounted) {
                    setProduct(productRes.data);
                    setSelectedImage(productRes.data.primary_image);
                    setReviews(reviewsRes.data.results || reviewsRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
                if (isMounted) {
                    toast.error('Product not found');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    const handleQuantityChange = (newQuantity: number) => {
        if (!product) return;

        // Ensure within stock limits logically
        const safeQuantity = Math.min(product.stock, newQuantity);

        if (safeQuantity > 5) {
            setShowB2BModal(true);
            setQuantity(5);
            return;
        }
        setQuantity(Math.max(1, safeQuantity));
    };

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            await addToCart(product.id, quantity);
            toast.success('Added to cart');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to add to cart');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            <B2BContactModal
                isOpen={showB2BModal}
                onClose={() => setShowB2BModal(false)}
                productName={product?.name}
                quantity={6}
            />

            {/* Fixed Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            {/* Scrollable Content */}
            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto">
                    {isLoading ? (
                        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                            <Skeleton className="aspect-[4/3] w-full rounded-2xl bg-white/5 border border-white/10" />
                            <div className="space-y-6">
                                <Skeleton className="h-4 w-24 bg-white/5" />
                                <Skeleton className="h-12 w-3/4 bg-white/5" />
                                <Skeleton className="h-6 w-1/3 bg-white/5" />
                                <div className="py-6 border-y border-white/10">
                                    <Skeleton className="h-10 w-40 bg-white/5" />
                                </div>
                                <div className="flex gap-4">
                                    <Skeleton className="h-14 w-32 bg-white/5 rounded-xl" />
                                    <Skeleton className="h-14 flex-1 bg-white/5 rounded-xl" />
                                </div>
                                <Skeleton className="h-32 w-full bg-white/5 rounded-xl" />
                            </div>
                        </div>
                    ) : !product ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <h1 className="text-4xl font-display font-bold mb-6">PRODUCT NOT FOUND</h1>
                            <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/10">
                                <Link href="/products">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-8">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                                <span>/</span>
                                <Link href="/products" className="hover:text-white transition-colors">Store</Link>
                                <span>/</span>
                                <span className="text-purple-400">{product.name}</span>
                            </nav>

                            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">

                                {/* Left Column: Images */}
                                <div className="space-y-4">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="aspect-[4/3] bg-white/5 border border-white/10 relative group overflow-hidden rounded-2xl backdrop-blur-sm"
                                    >
                                        {selectedImage ? (
                                            <Image
                                                src={selectedImage}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-12 transition-transform duration-700 ease-out group-hover:scale-110"
                                                priority
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-600">No Image</div>
                                        )}

                                        {product.discount_percent > 0 && (
                                            <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                                -{product.discount_percent}%
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Thumbnails */}
                                    {product.images.length > 1 && (
                                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                            {product.images.map((image) => (
                                                <button
                                                    key={image.id}
                                                    onClick={() => setSelectedImage(image.image)}
                                                    className={cn(
                                                        "relative w-20 h-20 flex-shrink-0 border transition-all p-2 bg-white/5 rounded-2xl overflow-hidden",
                                                        selectedImage === image.image
                                                            ? 'border-purple-500 opacity-100 ring-2 ring-purple-500/20'
                                                            : 'border-transparent opacity-50 hover:opacity-100 hover:border-white/30'
                                                    )}
                                                >
                                                    <Image
                                                        src={image.image}
                                                        alt="Thumbnail"
                                                        fill
                                                        sizes="80px"
                                                        className="object-contain p-1"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Info */}
                                <div className="flex flex-col">
                                    <div className="sticky top-32 space-y-6 p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl shadow-purple-900/5">

                                        {/* Header Info */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <Link href={`/products?category=${product.category.slug}`} className="text-xs font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors">
                                                    {product.category.name}
                                                </Link>

                                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                                    {product.is_in_stock ? (
                                                        <span className="flex items-center gap-1.5 text-green-400">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                            </span>
                                                            In Stock
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-red-400">
                                                            <AlertCircle size={14} /> Out of Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h1 className="text-4xl lg:text-5xl font-display font-bold leading-tight tracking-tight mb-4 text-white">
                                                {product.name}
                                            </h1>

                                            <div className="flex items-center gap-4 text-sm font-medium text-neutral-400">
                                                <div className="flex items-center gap-1">
                                                    <Star size={16} className="fill-yellow-500 text-yellow-500" />
                                                    <span className="text-white ml-1">{product.average_rating.toFixed(1)}</span>
                                                </div>
                                                <span className="w-1 h-1 bg-neutral-600 rounded-full"></span>
                                                <button onClick={() => setActiveTab('reviews')} className="hover:text-white hover:underline transition-colors">
                                                    {product.review_count} Reviews
                                                </button>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="py-6 border-y border-white/10">
                                            <div className="flex items-baseline gap-4">
                                                <span className="text-4xl font-mono font-bold text-white tracking-tight">
                                                    {formatPrice(product.current_price)}
                                                </span>
                                                {product.sale_price && (
                                                    <span className="text-lg text-neutral-500 line-through font-mono">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                {/* Quantity */}
                                                <div className="flex items-center border border-white/10 bg-white/5 rounded-xl h-14">
                                                    <button
                                                        onClick={() => handleQuantityChange(quantity - 1)}
                                                        className="w-12 h-full flex items-center justify-center hover:bg-white/10 transition-colors text-white rounded-l-xl"
                                                    >
                                                        <Minus size={18} />
                                                    </button>
                                                    <div className="w-12 h-full flex items-center justify-center font-mono font-bold text-lg text-white">
                                                        {quantity}
                                                    </div>
                                                    <button
                                                        onClick={() => handleQuantityChange(quantity + 1)}
                                                        className="w-12 h-full flex items-center justify-center hover:bg-white/10 transition-colors text-white rounded-r-xl"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </div>

                                                {/* Add to Cart */}
                                                <Button
                                                    onClick={handleAddToCart}
                                                    disabled={!product.is_in_stock || cartLoading}
                                                    size="xl"
                                                    className="flex-1 h-14 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                                                >
                                                    {cartLoading ? (
                                                        <span className="animate-pulse">Processing...</span>
                                                    ) : (
                                                        <>Add to Cart <span className="mx-2">•</span> {formatPrice(product.current_price * quantity)}</>
                                                    )}
                                                </Button>

                                                <Button size="icon" variant="outline" className="h-14 w-14 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-red-400 transition-colors">
                                                    <Heart size={20} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Policies */}
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                                <Shield size={20} className="text-purple-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-bold text-white uppercase">Warranty</p>
                                                    <p className="text-[10px] text-neutral-400 mt-0.5">12 Months Official</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                                <Truck size={20} className="text-blue-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs font-bold text-white uppercase">Shipping</p>
                                                    <p className="text-[10px] text-neutral-400 mt-0.5">Free Nationwide</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Tabs */}
                            <div className="mt-32 max-w-5xl mx-auto">
                                <div className="flex items-center gap-8 md:gap-12 border-b border-white/10 mb-12 overflow-x-auto">
                                    {[
                                        { key: 'description', label: 'Overview' },
                                        { key: 'specs', label: 'Specifications' },
                                        { key: 'reviews', label: `Reviews (${product.review_count})` },
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key as any)}
                                            className={cn(
                                                "pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
                                                activeTab === tab.key
                                                    ? "text-white opacity-100"
                                                    : "text-neutral-500 opacity-60 hover:opacity-100 hover:text-white"
                                            )}
                                        >
                                            {tab.label}
                                            {activeTab === tab.key && (
                                                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="min-h-[300px] text-neutral-300">
                                    <AnimatePresence mode='wait'>
                                        {activeTab === 'description' && (
                                            <motion.div
                                                key="description"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.3 }}
                                                className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-white prose-p:text-neutral-400 prose-p:leading-relaxed"
                                            >
                                                <div dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }} />
                                            </motion.div>
                                        )}

                                        {activeTab === 'specs' && (
                                            <motion.div
                                                key="specs"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                                                    {product.attributes && Object.keys(product.attributes).length > 0 ? (
                                                        Object.entries(product.attributes).map(([key, value]) => (
                                                            <div key={key} className="flex justify-between py-4 border-b border-white/10 hover:bg-white/5 px-2 transition-colors rounded-lg">
                                                                <span className="text-neutral-500 font-medium">{key}</span>
                                                                <span className="font-semibold text-right text-white">{value}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-neutral-500">No specifications available.</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === 'reviews' && (
                                            <motion.div
                                                key="reviews"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="space-y-8">
                                                    {reviews.length > 0 ? (
                                                        reviews.map((review) => (
                                                            <div key={review.id} className="border-b border-white/10 pb-8 last:border-0">
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center font-bold text-white rounded-full border border-white/10 text-lg">
                                                                            {review.user_name[0].toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-bold text-white">{review.user_name}</p>
                                                                            <div className="flex text-yellow-500 mt-1">
                                                                                {[...Array(5)].map((_, i) => (
                                                                                    <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-neutral-700 fill-neutral-700"} />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-xs text-neutral-500 font-mono">
                                                                        {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                                                    </span>
                                                                </div>
                                                                <p className="text-neutral-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                                                                    "{review.comment}"
                                                                </p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                                            <p className="text-neutral-500 mb-6">No reviews yet for this product.</p>
                                                            <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">Be the first to review</Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
