"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Plus, Search, Pencil, Trash2, Package, Loader2, Filter, Download, X } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

// Types
interface Product {
    id: string;
    name: string;
    slug: string;
    current_price: number | string;
    stock: number;
    category: { id: number; name: string; slug: string } | null;
    is_in_stock: boolean;
    primary_image: string | null;
    is_active: boolean;
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

export default function ProductsPage() {
    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [featuredFilter, setFeaturedFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);

    // Debounce search
    const debouncedSearch = useDebounce(search, 500);

    // Fetch Initial Data
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get("/catalog/categories/");
                setCategories(response.data.results || response.data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Products when filters change
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (debouncedSearch) params.append("search", debouncedSearch);
                if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter);
                if (statusFilter !== "all") params.append("is_active", statusFilter === "active" ? "true" : "false");
                if (featuredFilter !== "all") params.append("is_featured", featuredFilter === "featured" ? "true" : "false");

                const response = await api.get(`/catalog/products/admin/?${params.toString()}`);
                const data = response.data.results || response.data;
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [debouncedSearch, categoryFilter, statusFilter, featuredFilter]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const params = new URLSearchParams();
            params.append("export", "excel");
            if (debouncedSearch) params.append("search", debouncedSearch);
            if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter);
            if (statusFilter !== "all") params.append("is_active", statusFilter === "active" ? "true" : "false");
            if (featuredFilter !== "all") params.append("is_featured", featuredFilter === "featured" ? "true" : "false");

            // Trigger download
            const response = await api.get(`/catalog/products/admin/?${params.toString()}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'products_export.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const clearFilters = () => {
        setSearch("");
        setCategoryFilter("all");
        setStatusFilter("all");
        setFeaturedFilter("all");
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Fixed Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-7xl">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">Products</h1>
                            <p className="text-neutral-400 text-lg">Manage your store&apos;s catalog and inventory.</p>
                        </div>
                        <Link href="/admin/products/new">
                            <Button
                                size="lg"
                                className="bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] transition-all rounded-xl"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add New Product
                            </Button>
                        </Link>
                    </div>

                    {/* Content Container */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl shadow-purple-900/5 overflow-hidden flex flex-col min-h-[600px]">

                        {/* Toolbar */}
                        <div className="p-6 border-b border-white/10 space-y-4">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                {/* Search */}
                                <div className="relative w-full md:max-w-md group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, SKU..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all font-medium"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={cn(
                                            "border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl h-11 transition-all",
                                            showFilters ? "bg-white/20 border-purple-500/30 text-purple-200" : "bg-white/5"
                                        )}
                                    >
                                        <Filter className="w-4 h-4 mr-2" />
                                        Filters
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleExport}
                                        disabled={isExporting}
                                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl h-11"
                                    >
                                        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                        Export
                                    </Button>
                                </div>
                            </div>

                            {/* Filter Bar */}
                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2 fade-in duration-200">
                                    {/* Category Filter */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-neutral-500 ml-1">Category</label>
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="bg-black/20 border-white/10 text-white h-11 rounded-xl">
                                                <SelectValue placeholder="All Categories" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Status Filter */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-neutral-500 ml-1">Status</label>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="bg-black/20 border-white/10 text-white h-11 rounded-xl">
                                                <SelectValue placeholder="All Status" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Featured Filter */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-neutral-500 ml-1">Featured</label>
                                        <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                                            <SelectTrigger className="bg-black/20 border-white/10 text-white h-11 rounded-xl">
                                                <SelectValue placeholder="All" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                <SelectItem value="all">All</SelectItem>
                                                <SelectItem value="featured">Featured Only</SelectItem>
                                                <SelectItem value="normal">Normal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Clear Button */}
                                    <div className="flex items-end">
                                        <Button
                                            variant="ghost"
                                            onClick={clearFilters}
                                            className="w-full h-11 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Clear Filters
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full min-w-[1000px] text-left border-collapse">
                                <thead className="sticky top-0 z-20 bg-black/40 backdrop-blur-md">
                                    <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-neutral-500">
                                        <th className="px-6 py-4 font-medium">Product Details</th>
                                        <th className="px-6 py-4 font-medium">Category</th>
                                        <th className="px-6 py-4 font-medium">Price</th>
                                        <th className="px-6 py-4 font-medium">Stock Status</th>
                                        <th className="px-6 py-4 font-medium">Quantity</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        [...Array(6)].map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={6} className="px-6 py-4">
                                                    <div className="h-14 w-full bg-white/5 rounded-xl animate-pulse" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : products.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3 text-neutral-500">
                                                    <Package className="w-16 h-16 mb-2 opacity-20" />
                                                    <h3 className="text-lg font-medium text-white">No products found</h3>
                                                    <p className="text-sm">Try adjusting your filters or search terms.</p>
                                                    <Button variant="link" onClick={clearFilters} className="mt-2 text-purple-400">Clear all filters</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((product) => (
                                            <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4 align-middle">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 relative">
                                                            {product.primary_image ? (
                                                                <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-neutral-700 bg-neutral-900">
                                                                    <Package size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-base group-hover:text-purple-400 transition-colors line-clamp-1">{product.name}</div>
                                                            {product.is_active ?
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 mt-1">Active</span> :
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-500/10 text-neutral-500 mt-1">Inactive</span>
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-middle">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-neutral-300 border border-white/10">
                                                        {product.category?.name || "Uncategorized"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 align-middle font-medium text-white">
                                                    {typeof product.current_price === 'number'
                                                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.current_price)
                                                        : product.current_price}
                                                </td>
                                                <td className="px-6 py-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            product.is_in_stock ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                                        )} />
                                                        <span className={cn(
                                                            "text-sm font-medium",
                                                            product.is_in_stock ? "text-emerald-400" : "text-red-400"
                                                        )}>
                                                            {product.is_in_stock ? "In Stock" : "Out of Stock"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-middle text-neutral-400 font-mono text-sm">
                                                    {product.stock} units
                                                </td>
                                                <td className="px-6 py-4 align-middle text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link href={`/admin/products/${product.id}/edit`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/10">
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-400 hover:bg-red-500/10">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between text-xs text-neutral-500 sticky bottom-0">
                            <div>Showing {products.length} products</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
