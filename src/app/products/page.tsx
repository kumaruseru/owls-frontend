"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, ChevronDown, Star, ShoppingBag, Grid, List, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuroraBackground } from '@/components/ui/aurora-background';
import api from '@/lib/api';
import { useCartStore } from '@/store/cart-store';
import { cn, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    current_price: number;
    discount_percent: number;
    primary_image: string | null;
    category: { id: number; name: string; slug: string };
    brand?: string;
    color?: string;
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

function ProductsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Filters State
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || '-created_at');
    const [selectedBrands, setSelectedBrands] = useState<string[]>(searchParams.get('brand') ? searchParams.get('brand')!.split(',') : []);
    const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });

    // Filter Options (Dynamic)
    const [filterOptions, setFilterOptions] = useState<{ brands: string[], colors: string[] }>({ brands: [], colors: [] });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const { addToCart } = useCartStore();

    // Helper to update URL with current filters
    const updateFilters = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        router.push(`/products?${params.toString()}`);
    };

    // Initial Fetch: Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/catalog/categories/');
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Sync state with URL params
    useEffect(() => {
        const category = searchParams.get('category') || '';
        const search = searchParams.get('search') || '';
        const sort = searchParams.get('sort') || '-created_at';
        const brandParam = searchParams.get('brand') || '';
        const brands = brandParam ? brandParam.split(',') : [];
        const color = searchParams.get('color') || '';
        const page = parseInt(searchParams.get('page') || '1');

        if (category !== selectedCategory) setSelectedCategory(category);
        if (search !== searchQuery) setSearchQuery(search);
        if (sort !== sortBy) setSortBy(sort);
        if (JSON.stringify(brands) !== JSON.stringify(selectedBrands)) setSelectedBrands(brands);
        if (color !== selectedColor) setSelectedColor(color);
        if (page !== currentPage) setCurrentPage(page);
    }, [searchParams]);

    // Fetch Products & Dynamic Filters
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const fetchProductsAndFilters = async () => {
                setIsLoading(true);
                try {
                    const params = new URLSearchParams();
                    if (searchQuery) params.append('search', searchQuery);
                    if (selectedCategory) params.append('category__slug', selectedCategory);
                    if (sortBy) params.append('ordering', sortBy);
                    if (selectedBrands.length > 0) params.append('brand', selectedBrands.join(',')); // Join array
                    if (selectedColor) params.append('color', selectedColor);
                    if (priceRange.min) params.append('min_price', priceRange.min);
                    if (priceRange.max) params.append('max_price', priceRange.max);
                    params.append('page', currentPage.toString());

                    // Fetch products and filter options in parallel
                    const [productsRes, filtersRes] = await Promise.all([
                        api.get(`/catalog/products/?${params.toString()}`),
                        api.get(`/catalog/products/filters/?${params.toString()}`)
                    ]);

                    // Handle paginated response
                    if (productsRes.data.results) {
                        setProducts(productsRes.data.results);
                        // Calculate total pages assuming page size is fixed (9) or returned in metadata if available. 
                        // DRF default pagination returns count.
                        const count = productsRes.data.count || 0;
                        setTotalPages(Math.ceil(count / 9));
                    } else if (Array.isArray(productsRes.data)) {
                        // Fallback for non-paginated (though we are paginating now)
                        setProducts(productsRes.data);
                        setTotalPages(1);
                    } else {
                        setProducts([]);
                        setTotalPages(1);
                    }

                    setFilterOptions(filtersRes.data);

                } catch (error) {
                    console.error('Failed to fetch data:', error);
                    toast.error('Unable to load products');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProductsAndFilters();
        }, 300); // Debounce

        return () => clearTimeout(timeoutId);
    }, [selectedCategory, sortBy, searchQuery, selectedBrands, selectedColor, priceRange.min, priceRange.max, currentPage]);

    const handleAddToCart = async (productId: string) => {
        try {
            await addToCart(productId, 1);
            toast.success('Added to cart');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to add to cart');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Fixed Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">

                {/* Page Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">Collection</h1>
                        <p className="text-neutral-400 mt-2 text-lg">
                            {products.length} Products found {selectedCategory && `in ${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}`}
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative group w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onBlur={() => updateFilters({ search: searchQuery, page: '1' })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        updateFilters({ search: searchQuery, page: '1' });
                                    }
                                }}
                                className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative w-full md:w-56">
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    updateFilters({ sort: e.target.value, page: '1' });
                                }}
                                className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-all"
                            >
                                <option value="-created_at" className="bg-neutral-900">Newest Arrivals</option>
                                <option value="price" className="bg-neutral-900">Price: Low to High</option>
                                <option value="-price" className="bg-neutral-900">Price: High to Low</option>
                                <option value="-average_rating" className="bg-neutral-900">Top Rated</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={16} />
                        </div>

                        {/* View Toggle (Desktop) */}
                        <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-2.5 rounded-lg transition-all",
                                    viewMode === 'grid' ? "bg-white/10 text-white shadow-sm" : "text-neutral-500 hover:text-white"
                                )}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-2.5 rounded-lg transition-all",
                                    viewMode === 'list' ? "bg-white/10 text-white shadow-sm" : "text-neutral-500 hover:text-white"
                                )}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        {/* Mobile Filter Toggle */}
                        <Button
                            onClick={() => setShowFilters(true)}
                            variant="outline"
                            className="md:hidden h-12 bg-white/5 border-white/10 text-white w-full"
                        >
                            <Filter size={18} className="mr-2" /> Filters
                        </Button>
                    </div>
                </div>

                <div className="flex gap-8 items-start">

                    {/* Sidebar Filters */}
                    <aside className={cn(
                        "fixed inset-0 z-50 bg-neutral-900/95 backdrop-blur-xl p-6 transition-transform duration-300 md:static md:z-0 md:w-64 md:bg-transparent md:p-0 md:translate-x-0 md:block shrink-0",
                        showFilters ? "translate-x-0 flex flex-col" : "-translate-x-full hidden"
                    )}>
                        <div className="flex items-center justify-between md:hidden mb-8">
                            <h2 className="text-xl font-bold font-display text-white">Filters</h2>
                            <button onClick={() => setShowFilters(false)} className="text-white bg-white/10 p-2 rounded-full"><X size={20} /></button>
                        </div>

                        {/* Filter Groups */}
                        <div className="space-y-8 overflow-y-auto md:overflow-visible custom-scrollbar">

                            {/* Categories */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Categories</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => updateFilters({ category: '', page: '1' })}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex justify-between",
                                            !selectedCategory ? "bg-white/10 text-white font-medium" : "text-neutral-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        All Products
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => updateFilters({ category: cat.slug, page: '1' })}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex justify-between",
                                                selectedCategory === cat.slug ? "bg-white/10 text-white font-medium" : "text-neutral-400 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {cat.name}
                                            <span className="text-xs opacity-50">{cat.product_count}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-white/10 w-full" />

                            {/* Brands Filter */}
                            {filterOptions.brands.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Brands</h3>
                                    <div className="space-y-2">
                                        {filterOptions.brands.map((brand) => (
                                            <label key={brand} className="flex items-center gap-3 cursor-pointer group p-1">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBrands.includes(brand)}
                                                        onChange={() => {
                                                            let newBrands: string[];
                                                            if (selectedBrands.includes(brand)) {
                                                                newBrands = selectedBrands.filter(b => b !== brand);
                                                            } else {
                                                                newBrands = [...selectedBrands, brand];
                                                            }
                                                            setSelectedBrands(newBrands);
                                                            updateFilters({ brand: newBrands.join(','), page: '1' });
                                                        }}
                                                        className="peer h-4 w-4 appearance-none rounded border border-white/20 bg-white/5 checked:bg-purple-500 checked:border-purple-500 transition-all cursor-pointer"
                                                    />
                                                    <div className="pointer-events-none absolute inset-0 hidden items-center justify-center text-white peer-checked:flex">
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                </div>
                                                <span className={cn("text-sm transition-colors", selectedBrands.includes(brand) ? "text-white font-medium" : "text-neutral-400 group-hover:text-white")}>{brand}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price Range */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Price Range</h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                        onBlur={() => updateFilters({ min_price: priceRange.min, page: '1' })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50"
                                    />
                                    <span className="text-neutral-600">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                        onBlur={() => updateFilters({ max_price: priceRange.max, page: '1' })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>
                            </div>

                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-h-[500px]">
                        {isLoading ? (
                            <div className={cn(
                                "grid gap-6",
                                viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                            )}>
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className={cn(
                                        "rounded-3xl border border-white/5 bg-white/5 p-4 animate-pulse",
                                        viewMode === 'list' && "flex gap-6 items-center"
                                    )}>
                                        <div className={cn(
                                            "rounded-2xl",
                                            viewMode === 'grid' ? "aspect-square w-full mb-4" : "h-40 w-40 shrink-0"
                                        )}>
                                            <Skeleton className="h-full w-full rounded-2xl bg-white/10" />
                                        </div>
                                        <div className={cn("flex flex-col gap-3 w-full", viewMode === 'list' && "flex-1")}>
                                            <div className="flex justify-between">
                                                <Skeleton className="h-3 w-20 bg-white/10 rounded" />
                                                <Skeleton className="h-4 w-10 bg-white/10 rounded" />
                                            </div>
                                            <Skeleton className="h-5 w-3/4 bg-white/10 rounded" />
                                            <Skeleton className="h-4 w-1/2 bg-white/10 rounded" />
                                            <div className="mt-auto pt-4 flex justify-between items-end">
                                                <div className="space-y-1.5">
                                                    <Skeleton className="h-3 w-16 bg-white/10 rounded" />
                                                    <Skeleton className="h-6 w-28 bg-white/10 rounded" />
                                                </div>
                                                <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 py-32 text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingBag size={32} className="text-neutral-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    No products found
                                </h3>
                                <p className="mt-2 text-neutral-400 max-w-md mx-auto">
                                    We couldn&apos;t find any products matching your filters. Try adjusting your search criteria.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-8 border-white/10 text-white hover:bg-white/10"
                                    onClick={() => { setSearchQuery(''); setSelectedCategory(''); setSelectedBrands([]); setSelectedColor(''); setPriceRange({ min: '', max: '' }); updateFilters({ page: '1' }); }}
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className={cn(
                                    "grid gap-6 mb-12",
                                    viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                                )}>
                                    {products.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/products/${product.slug}`}
                                            className={cn(
                                                "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-purple-500/30 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/10",
                                                viewMode === 'list' && "flex flex-row gap-6 items-center"
                                            )}
                                        >
                                            {/* Image Container */}
                                            <div className={cn(
                                                "relative overflow-hidden rounded-2xl bg-black/20",
                                                viewMode === 'grid' ? "aspect-square w-full" : "h-40 w-40 shrink-0"
                                            )}>
                                                {product.primary_image ? (
                                                    <Image
                                                        src={product.primary_image}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-neutral-700 bg-neutral-900">
                                                        <ShoppingBag size={32} />
                                                    </div>
                                                )}

                                                {/* Badges */}
                                                <div className="absolute left-3 top-3 flex flex-col gap-2">
                                                    {product.sale_price && (
                                                        <span className="inline-flex items-center rounded-lg bg-red-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-lg">
                                                            Sale {product.discount_percent > 0 && `-${product.discount_percent}%`}
                                                        </span>
                                                    )}
                                                    {!product.is_in_stock && (
                                                        <span className="inline-flex items-center rounded-lg bg-neutral-900/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-lg border border-white/10">
                                                            Sold Out
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className={cn("mt-4 flex flex-col", viewMode === 'list' && "mt-0 flex-1")}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                                                        {product.brand || product.category?.name || "Uncategorized"}
                                                    </span>
                                                    {product.average_rating > 0 && (
                                                        <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-md">
                                                            <Star size={10} fill="currentColor" />
                                                            <span className="text-xs font-bold">{product.average_rating}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <h3 className="line-clamp-2 text-lg font-bold text-white transition-colors group-hover:text-purple-300 mb-2">
                                                    {product.name}
                                                </h3>

                                                <div className="mt-auto flex items-end justify-between">
                                                    <div className="flex flex-col">
                                                        {product.sale_price ? (
                                                            <>
                                                                <span className="text-sm text-neutral-500 line-through decoration-white/20">
                                                                    {formatPrice(product.price)}
                                                                </span>
                                                                <span className="text-xl font-bold text-white">
                                                                    {formatPrice(product.current_price)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xl font-bold text-white">
                                                                {formatPrice(product.current_price)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (product.is_in_stock) handleAddToCart(product.id);
                                                        }}
                                                        disabled={!product.is_in_stock}
                                                        className={cn(
                                                            "flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition-all hover:bg-purple-400 hover:text-white hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                                                            viewMode === 'grid' && "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                                                        )}
                                                    >
                                                        <ShoppingBag size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        <Button
                                            variant="outline"
                                            onClick={() => updateFilters({ page: String(currentPage - 1) })}
                                            disabled={currentPage <= 1}
                                            className="border-white/10 text-white hover:bg-white/10"
                                        >
                                            Previous
                                        </Button>

                                        <div className="flex gap-1">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <Button
                                                    key={i}
                                                    variant={currentPage === i + 1 ? "default" : "outline"}
                                                    onClick={() => updateFilters({ page: String(i + 1) })}
                                                    className={cn(
                                                        currentPage === i + 1
                                                            ? "bg-purple-600 hover:bg-purple-500 border-none"
                                                            : "border-white/10 text-white hover:bg-white/10",
                                                        "w-10 px-0"
                                                    )}
                                                >
                                                    {i + 1}
                                                </Button>
                                            ))}
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => updateFilters({ page: String(currentPage + 1) })}
                                            disabled={currentPage >= totalPages}
                                            className="border-white/10 text-white hover:bg-white/10"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <ProductsContent />
        </Suspense>
    );
}
