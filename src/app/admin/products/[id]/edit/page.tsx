"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useForm, SubmitHandler, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    ArrowLeft, Save, Upload, X, Loader2, AlertCircle, ImageIcon, Trash2,
    LayoutGrid, DollarSign, Package, Settings, Star, Image as ImageIconSmall, ClipboardList, Plus
} from "lucide-react";
import { toast } from "react-hot-toast";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { cn } from "@/lib/utils";
import React from "react"; // Explicit import for React.ChangeEvent

// --- Types & Schemas ---

const productSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    slug: z.string().optional(),
    short_description: z.string().max(500, "Short description is too long").optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be positive"),
    sale_price: z.coerce.number().min(0, "Sale price must be positive").optional().or(z.literal("")),
    stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
    sku: z.string().optional(),
    brand: z.string().optional(),
    color: z.string().optional(),
    category: z.coerce.string().min(1, "Category is required"),
    attributes: z.array(z.object({
        key: z.string().min(1, "Key is required"),
        value: z.string().min(1, "Value is required")
    })).optional(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface ProductImage {
    id: number;
    image: string;
    is_primary: boolean;
    alt_text?: string;
}

// --- Component ---

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // In Next.js 15+, params is a Promise. We need to unwrap it.
    const resolvedParams = React.use(params);
    const productId = resolvedParams.id;

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<'general' | 'specs' | 'pricing' | 'media' | 'settings'>('general');

    // Media State
    const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<ProductFormValues>({
        // @ts-ignore
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            short_description: "",
            description: "",
            category: "",
            is_active: true,
            is_featured: false,
            stock: 0,
            price: 0,
            sale_price: "",
            sku: "",
            brand: "",
            color: "",
            attributes: [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "attributes"
    });

    const watchedName = watch("name");

    useEffect(() => {
        const loadData = async () => {
            await fetchCategories();
            if (productId) {
                await fetchProductData();
            }
        };
        loadData();
    }, [productId]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/catalog/categories/');
            const data = response.data.results || response.data;
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const fetchProductData = async () => {
        setIsFetching(true);
        try {
            const response = await api.get(`/catalog/products/admin/${productId}/`);
            const product = response.data;

            setValue("name", product.name);
            setValue("slug", product.slug);
            setValue("short_description", product.short_description || "");
            setValue("description", product.description || "");
            setValue("price", product.price);
            setValue("sale_price", product.sale_price !== null ? product.sale_price : "");
            setValue("stock", product.stock);
            setValue("sku", product.sku || "");
            setValue("brand", product.brand || "");
            setValue("color", product.color || "");
            setValue("category", typeof product.category === 'object' ? product.category.id.toString() : product.category.toString());
            setValue("is_active", product.is_active);
            setValue("is_featured", product.is_featured);

            // Transform attributes object to array
            if (product.attributes && typeof product.attributes === 'object') {
                const specs = Object.entries(product.attributes).map(([key, value]) => ({
                    key,
                    value: String(value)
                }));
                setValue("attributes", specs);
            }

            if (product.images && Array.isArray(product.images)) {
                setExistingImages(product.images);
            }
        } catch (error) {
            console.error("Failed to fetch product", error);
            toast.error("Failed to load product details");
            router.push('/admin/products');
        } finally {
            setIsFetching(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearPendingImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSetPrimary = async (imageId: number) => {
        try {
            await api.post(`/catalog/products/images/${imageId}/set-primary/`);
            setExistingImages(prev => prev.map(img => ({
                ...img,
                is_primary: img.id === imageId
            })));
            toast.success('Image set as primary');
        } catch (error) {
            console.error('Failed to set primary image:', error);
            toast.error('Failed to set primary image');
        }
    };

    const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            if (data.short_description) formData.append('short_description', data.short_description);
            formData.append('description', data.description || '');
            formData.append('price', data.price.toString());
            if (data.sale_price !== "" && data.sale_price !== undefined) {
                formData.append('sale_price', data.sale_price.toString());
            } else {
                formData.append('sale_price', '');
            }
            formData.append('stock', data.stock.toString());
            if (data.sku) formData.append('sku', data.sku);
            if (data.brand) formData.append('brand', data.brand);
            if (data.color) formData.append('color', data.color);
            formData.append('category', data.category);
            formData.append('is_active', data.is_active.toString());
            formData.append('is_featured', data.is_featured.toString());

            // Handle Attributes
            if (data.attributes && data.attributes.length > 0) {
                const attributesObj = data.attributes.reduce((acc, curr) => {
                    if (curr.key && curr.value) {
                        acc[curr.key] = curr.value;
                    }
                    return acc;
                }, {} as Record<string, string>);
                formData.append('attributes', JSON.stringify(attributesObj));
            } else {
                formData.append('attributes', '{}');
            }

            if (imageFile) {
                formData.append('image', imageFile);
            }

            await api.patch(`/catalog/products/admin/${productId}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success("Product updated successfully");
            await fetchProductData();
            clearPendingImage();

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Failed to update product");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        setIsLoading(true);
        try {
            await api.delete(`/catalog/products/admin/${productId}/`);
            toast.success("Product deleted successfully");
            router.push('/admin/products');
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete product");
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
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

            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-6xl">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/products">
                                <Button variant="ghost" size="icon" className="rounded-xl w-12 h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
                                    {watchedName || "Edit Product"}
                                </h1>
                                <p className="text-neutral-400 mt-1 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                                    Editing Mode
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={handleDelete}
                                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-xl w-12 h-12"
                                title="Delete Product"
                            >
                                <Trash2 className="w-5 h-5" />
                            </Button>
                            <Button
                                onClick={handleSubmit(onSubmit as any, (errors) => {
                                    console.error("Validation Errors:", errors);
                                    toast.error(`Please check required fields: ${Object.keys(errors).join(", ")}`);
                                })}
                                disabled={isLoading}
                                size="xl"
                                className="hidden md:flex rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-purple-900/20"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Sidebar / Tabs */}
                        <div className="lg:col-span-3 space-y-2">
                            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                                {[
                                    { id: 'general', label: 'General Info', icon: LayoutGrid },
                                    { id: 'specs', label: 'Technical Specs', icon: ClipboardList },
                                    { id: 'pricing', label: 'Pricing & Inventory', icon: DollarSign },
                                    { id: 'media', label: 'Media Gallery', icon: ImageIconSmall },
                                    { id: 'settings', label: 'Settings', icon: Settings },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                                            activeTab === tab.id
                                                ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                                                : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                                        )}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>

                            <Button
                                onClick={handleSubmit(onSubmit as any)}
                                disabled={isLoading}
                                size="lg"
                                className="w-full md:hidden flex items-center justify-center rounded-xl bg-white text-black font-bold uppercase mt-4"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save
                            </Button>
                        </div>

                        {/* Main Content Form */}
                        <div className="lg:col-span-9">
                            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">

                                {/* GENERAL TAB */}
                                {activeTab === 'general' && (
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <LayoutGrid className="w-5 h-5 text-purple-400" />
                                            General Information
                                        </h3>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Product Name</label>
                                                <input
                                                    type="text"
                                                    {...register('name')}
                                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                                    placeholder="Product Name"
                                                />
                                                {errors.name && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Category</label>
                                                <div className="relative">
                                                    <select
                                                        {...register('category')}
                                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 appearance-none transition-all"
                                                    >
                                                        <option value="" className="bg-neutral-900 text-neutral-500">Select Category</option>
                                                        {categories.map(cat => (
                                                            <option key={cat.id} value={cat.id} className="bg-neutral-900 text-white">{cat.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                                {errors.category && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.category.message}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Brand</label>
                                                    <input
                                                        type="text"
                                                        {...register('brand')}
                                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                                        placeholder="e.g. Apple, Sony"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Color</label>
                                                    <input
                                                        type="text"
                                                        {...register('color')}
                                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                                        placeholder="e.g. Black, White"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Short Description</label>
                                                <textarea
                                                    {...register('short_description')}
                                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all h-24 resize-none"
                                                    placeholder="Brief summary for cards and lists..."
                                                />
                                                <div className="text-right text-[10px] text-neutral-600">Max 500 chars</div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Full Description</label>
                                                <textarea
                                                    {...register('description')}
                                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all min-h-[300px]"
                                                    placeholder="Detailed product information..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SPECS TAB */}
                                {activeTab === 'specs' && (
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                <ClipboardList className="w-5 h-5 text-purple-400" />
                                                Technical Specifications
                                            </h3>
                                            <Button
                                                type="button"
                                                onClick={() => append({ key: "", value: "" })}
                                                variant="outline"
                                                size="sm"
                                                className="border-white/10 text-white hover:bg-white/10 rounded-lg"
                                            >
                                                <Plus className="w-4 h-4 mr-1" /> Add Spec
                                            </Button>
                                        </div>

                                        <div className="space-y-4">
                                            {fields.map((field, index) => (
                                                <div key={field.id} className="flex items-start gap-4 animate-in slide-in-from-left-2 duration-300">
                                                    <div className="flex-1 space-y-1">
                                                        <input
                                                            type="text"
                                                            {...register(`attributes.${index}.key` as const)}
                                                            placeholder="Spec Name (e.g. Processor)"
                                                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all text-sm font-bold"
                                                        />
                                                        {errors.attributes?.[index]?.key && (
                                                            <p className="text-red-400 text-xs ml-1">{errors.attributes[index]?.key?.message}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <input
                                                            type="text"
                                                            {...register(`attributes.${index}.value` as const)}
                                                            placeholder="Value (e.g. M3 Pro)"
                                                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all text-sm"
                                                        />
                                                        {errors.attributes?.[index]?.value && (
                                                            <p className="text-red-400 text-xs ml-1">{errors.attributes[index]?.value?.message}</p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => remove(index)}
                                                        className="mt-1 h-10 w-10 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}

                                            {fields.length === 0 && (
                                                <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                                                    <ClipboardList className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                                                    <p className="text-neutral-500 font-medium">No specifications added yet</p>
                                                    <p className="text-xs text-neutral-600 mt-1">Add details like Processor, RAM, Battery, etc.</p>
                                                    <Button
                                                        type="button"
                                                        onClick={() => append({ key: "", value: "" })}
                                                        variant="link"
                                                        className="text-purple-400 mt-2"
                                                    >
                                                        Add First Specification
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* PRICING TAB */}
                                {activeTab === 'pricing' && (
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-emerald-400" />
                                            Pricing & Inventory
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Regular Price (VND)</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">₫</span>
                                                    <Controller
                                                        name="price"
                                                        control={control}
                                                        render={({ field: { onChange, value } }) => (
                                                            <CurrencyInput
                                                                value={value}
                                                                onValueChange={(val) => onChange(val ?? 0)}
                                                                className="w-full pl-8 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all font-mono"
                                                                placeholder="0"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                {errors.price && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.price.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Sale Price (Optional)</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">₫</span>
                                                    <Controller
                                                        name="sale_price"
                                                        control={control}
                                                        render={({ field: { onChange, value } }) => (
                                                            <CurrencyInput
                                                                value={value ?? ""}
                                                                onValueChange={(val) => onChange(val ?? "")}
                                                                className="w-full pl-8 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all font-mono"
                                                                placeholder="Leave empty if not on sale"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                {errors.sale_price && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.sale_price.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Stock Quantity</label>
                                                <Controller
                                                    name="stock"
                                                    control={control}
                                                    render={({ field: { onChange, value } }) => (
                                                        <CurrencyInput
                                                            value={value}
                                                            onValueChange={(val) => onChange(val ?? 0)}
                                                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all font-mono"
                                                            placeholder="0"
                                                        />
                                                    )}
                                                />
                                                {errors.stock && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.stock.message}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">SKU (Stock Keeping Unit)</label>
                                                <input
                                                    type="text"
                                                    {...register('sku')}
                                                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all font-mono uppercase"
                                                    placeholder="E.g. HEAD-001"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* MEDIA TAB */}
                                {activeTab === 'media' && (
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <ImageIcon className="w-5 h-5 text-blue-400" />
                                            Media Gallery
                                        </h3>

                                        {/* Upload New */}
                                        <div className="mb-8">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1 mb-2 block">Upload New Image</label>
                                            <div className="p-1 rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
                                                <div className="relative h-48 w-full rounded-xl bg-black/20 flex flex-col items-center justify-center overflow-hidden">
                                                    {imagePreview ? (
                                                        <>
                                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm gap-2">
                                                                <span className="text-white text-sm font-medium">New Upload Pending Save</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-full"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        clearPendingImage();
                                                                    }}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-3 p-6 text-center">
                                                            <div className="p-3 bg-white/5 rounded-full ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
                                                                <Upload className="w-6 h-6 text-neutral-400 group-hover:text-purple-400 transition-colors" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-white">Click to upload image</p>
                                                                <p className="text-[10px] text-neutral-500 mt-1">Images will be added as primary upon save</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        onChange={handleImageChange}
                                                        disabled={!!imagePreview}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Existing Gallery */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Current Images ({existingImages.length})</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {existingImages.map((img) => (
                                                    <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-white/10 bg-black/20">
                                                        <img src={img.image} alt={img.alt_text} className="w-full h-full object-cover" />
                                                        {img.is_primary && (
                                                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-bold shadow-lg">
                                                                PRIMARY
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                className={cn(
                                                                    "text-white hover:bg-white/20 rounded-full h-8 w-8",
                                                                    img.is_primary && "text-yellow-400"
                                                                )}
                                                                onClick={() => handleSetPrimary(img.id)}
                                                                title={img.is_primary ? "Primary image" : "Set as primary"}
                                                            >
                                                                <Star className={cn("w-4 h-4", img.is_primary ? "fill-current" : "")} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {existingImages.length === 0 && !imagePreview && (
                                                    <div className="col-span-full py-8 text-center text-neutral-600 text-sm italic">
                                                        No images uploaded yet.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SETTINGS TAB */}
                                {activeTab === 'settings' && (
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-neutral-400" />
                                            Product Settings
                                        </h3>

                                        <div className="space-y-4">
                                            <label className="flex items-center gap-4 p-4 bg-black/20 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group">
                                                <input
                                                    type="checkbox"
                                                    {...register('is_active')}
                                                    className="w-5 h-5 rounded border-white/20 bg-black/40 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                                                />
                                                <div>
                                                    <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">Active Status</div>
                                                    <div className="text-xs text-neutral-500">Visible to customers in store</div>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-4 p-4 bg-black/20 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group">
                                                <input
                                                    type="checkbox"
                                                    {...register('is_featured')}
                                                    className="w-5 h-5 rounded border-white/20 bg-black/40 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0"
                                                />
                                                <div>
                                                    <div className="text-sm font-bold text-white group-hover:text-yellow-300 transition-colors">Featured Product</div>
                                                    <div className="text-xs text-neutral-500">Promoted on homepage and top lists</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
