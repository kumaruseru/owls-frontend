'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, ChevronDown, Star, ShoppingBag, Grid, List, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuroraBackground } from '@/components/ui/aurora-background';
import api from '@/lib/api';
import { useCartStore } from '@/store/cart-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    current_price: number;
    discount_percent: number;
    primary_image: string | null;
    category: { id: number; name: string; slug: string };
    is_in_stock: boolean;
    average_rating: number;
    review_count: number;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    product_count: number;
}

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-created_at');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    const { addToCart } = useCartStore();

    useEffect(() => {
        fetchCategories();
    }, []);

    // Sync state with URL params when they change (e.g. navigation from header)
    useEffect(() => {
        const category = searchParams.get('category') || '';
        const search = searchParams.get('search') || '';
        const sort = searchParams.get('sort') || '-created_at';

        if (category !== selectedCategory) setSelectedCategory(category);
        if (search !== searchQuery) setSearchQuery(search);
        if (sort !== sortBy) setSortBy(sort);
    }, [searchParams]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [selectedCategory, sortBy, searchQuery, priceRange.min, priceRange.max]); // Auto fetch on change

    const fetchCategories = async () => {
        try {
            const response = await api.get('/products/categories/');
            const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedCategory) params.append('category', selectedCategory);
            if (sortBy) params.append('ordering', sortBy);
            if (priceRange.min) params.append('min_price', priceRange.min);
            if (priceRange.max) params.append('max_price', priceRange.max);

            const response = await api.get(`/products/?${params.toString()}`);
            setProducts(response.data.results || response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Unable to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = async (productId: number) => {
        try {
            await addToCart(productId, 1);
            toast.success('Added to cart');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to add to cart');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const calculateDiscount = (price: number, salePrice: number) => {
        return Math.round(((price - salePrice) / price) * 100);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Fixed Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            {/* Scrollable Content */}
            <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">

                {/* Header */}
                <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-4xl font-display font-bold tracking-tight text-white md:text-6xl">
                            Collection
                        </h1>
                        <p className="mt-2 text-neutral-400">
                            {products.length} Products found {selectedCategory && `in ${categories.find(c => c.slug === selectedCategory)?.name}`}
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
                        {/* Search */}
                        <div className="relative group w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within:text-purple-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 focus:outline-none focus:ring-0 transition-all"
                            />
                        </div>

                        {/* Sort */}
                        <div className="relative w-full md:w-48">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-purple-500/50 focus:outline-none transition-all cursor-pointer"
                            >
                                <option value="-created_at" className="bg-neutral-900">Newest Arrivals</option>
                                <option value="price" className="bg-neutral-900">Price: Low to High</option>
                                <option value="-price" className="bg-neutral-900">Price: High to Low</option>
                                <option value="-average_rating" className="bg-neutral-900">Top Rated</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                        </div>

                        {/* View Toggle (Desktop) */}
                        <div className="hidden items-center rounded-xl border border-white/10 bg-white/5 p-1 md:flex">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "rounded-lg p-2 transition-all",
                                    viewMode === 'grid' ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"
                                )}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "rounded-lg p-2 transition-all",
                                    viewMode === 'list' ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"
                                )}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        {/* Filter Toggle (Mobile) */}
                        <Button
                            onClick={() => setShowFilters(true)}
                            variant="outline"
                            className="md:hidden h-11 border-white/10 bg-white/5 text-white"
                        >
                            <Filter size={18} className="mr-2" /> Filters
                        </Button>
                    </div>
                </div>

                <div className="flex gap-10">
                    {/* Sidebar Filters */}
                    <aside className={cn(
                        "fixed inset-0 z-50 flex flex-col bg-neutral-900 p-6 transition-transform duration-300 md:static md:z-0 md:w-64 md:translate-x-0 md:bg-transparent md:p-0",
                        showFilters ? "translate-x-0" : "-translate-x-full"
                    )}>
                        <div className="mb-8 flex items-center justify-between md:hidden">
                            <h2 className="text-xl font-bold font-display text-white">Filters</h2>
                            <button onClick={() => setShowFilters(false)} className="text-white"><X size={24} /></button>
                        </div>

                        <div className="space-y-8">
                            {/* Categories */}
                            <div>
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-400">Categories</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory('')}
                                        className={cn(
                                            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                                            !selectedCategory ? "bg-purple-500/10 text-purple-400" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <span>All Products</span>
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.slug)}
                                            className={cn(
                                                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                                                selectedCategory === category.slug ? "bg-purple-500/10 text-purple-400" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <span>{category.name}</span>
                                            <span className="text-xs opacity-50">{category.product_count}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-400">Price Range</h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:outline-none"
                                    />
                                    <span className="text-neutral-600">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <main className="flex-1">
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Loader2 size={32} className="animate-spin text-purple-500" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 py-32 text-center">
                                <ShoppingBag size={48} className="mb-4 text-neutral-600" />
                                <h3 className="text-xl font-bold text-white">No products found</h3>
                                <p className="mt-2 text-neutral-400">Try adjusting your filters or search terms.</p>
                                <Button
                                    variant="outline"
                                    className="mt-6 border-white/10 text-white hover:bg-white/10"
                                    onClick={() => { setSearchQuery(''); setSelectedCategory(''); setPriceRange({ min: '', max: '' }); }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className={cn(
                                "grid gap-6",
                                viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                            )}>
                                {products.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.slug}`}
                                        className={cn(
                                            "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-purple-500/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/10",
                                            viewMode === 'list' && "flex flex-row gap-6 items-center"
                                        )}
                                    >
                                        {/* Image */}
                                        <div className={cn(
                                            "relative overflow-hidden rounded-2xl bg-black/20",
                                            viewMode === 'grid' ? "aspect-square w-full" : "h-32 w-32 shrink-0"
                                        )}>
                                            {product.primary_image ? (
                                                <Image
                                                    src={product.primary_image}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-neutral-700">No Image</div>
                                            )}

                                            {/* Badges */}
                                            <div className="absolute left-2 top-2 flex flex-col gap-1">
                                                {product.sale_price && (
                                                    <span className="inline-flex items-center rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                                                        Sale
                                                    </span>
                                                )}
                                                {!product.is_in_stock && (
                                                    <span className="inline-flex items-center rounded-full bg-neutral-800/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                                                        Sold Out
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className={cn("mt-4 flex flex-col gap-1", viewMode === 'list' && "mt-0 flex-1")}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                                                    {product.category.name}
                                                </span>
                                                {product.average_rating > 0 && (
                                                    <div className="flex items-center gap-1 text-yellow-500">
                                                        <Star size={10} fill="currentColor" />
                                                        <span className="text-xs font-medium text-white/60">{product.average_rating}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="line-clamp-1 text-lg font-bold text-white transition-colors group-hover:text-purple-300">
                                                {product.name}
                                            </h3>

                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-lg font-bold text-white">
                                                        {formatPrice(product.current_price)}
                                                    </span>
                                                    {product.sale_price && (
                                                        <span className="text-sm text-neutral-500 line-through decoration-white/20">
                                                            {formatPrice(product.price)}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleAddToCart(product.id);
                                                    }}
                                                    disabled={!product.is_in_stock}
                                                    className={cn(
                                                        "flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-all hover:bg-purple-400 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed",
                                                        viewMode === 'grid' && "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                                                    )}
                                                >
                                                    <ShoppingBag size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}