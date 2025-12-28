"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Upload, X, Loader2, AlertCircle, ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input"; // Assuming you have this or use standard input
import { cn } from "@/lib/utils";

// Form Schema
const productSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be positive"),
    stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
    category: z.coerce.string().min(1, "Category is required"), // Use string for ID but coerce if select returns number
    brand: z.string().optional(),
    color: z.string().optional(),
    is_active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function NewProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { register, handleSubmit, control, formState: { errors } } = useForm<ProductFormValues>({
        // @ts-ignore
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            category: "",
            brand: "",
            color: "",
            is_active: true,
            stock: 0,
            price: 0,
        }
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/catalog/categories/');
                // Handle pagination if needed, otherwise assume list
                if (response.data.results && Array.isArray(response.data.results)) {
                    setCategories(response.data.results);
                } else if (Array.isArray(response.data)) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

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

    const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description || '');
            formData.append('price', data.price.toString());
            formData.append('stock', data.stock.toString());
            formData.append('category', data.category);
            formData.append('brand', data.brand || '');
            formData.append('color', data.color || '');
            formData.append('is_active', data.is_active.toString());

            if (imageFile) {
                formData.append('image', imageFile);
            }

            await api.post('/catalog/products/admin/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success("Product created successfully");
            router.push('/admin/products');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Failed to create product");
        } finally {
            setIsLoading(false);
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

            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-4xl">

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-10">
                        <Link href="/admin/products">
                            <Button variant="ghost" size="icon" className="rounded-xl w-12 h-12 bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">Add New Product</h1>
                            <p className="text-neutral-400 mt-1">Create a new item in your catalog.</p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl shadow-purple-900/5 overflow-hidden p-8">
                        <form onSubmit={handleSubmit((data) => onSubmit(data as unknown as ProductFormValues))} className="space-y-8">

                            {/* Section: Media */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-purple-400" />
                                    Product Media
                                </h3>
                                <div className="p-1 rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
                                    <div className="relative h-64 w-full rounded-xl bg-black/20 flex flex-col items-center justify-center overflow-hidden">
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-12 w-12 rounded-full shadow-xl"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setImagePreview(null);
                                                            setImageFile(null);
                                                        }}
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 p-6 text-center">
                                                <div className="p-4 bg-white/5 rounded-full ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
                                                    <Upload className="w-8 h-8 text-neutral-400 group-hover:text-purple-400 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">Click to upload main image</p>
                                                    <p className="text-xs text-neutral-500 mt-1">SVG, PNG, JPG or WEBP (max 2MB)</p>
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

                            <div className="h-px bg-white/10" />

                            {/* Section: General Info */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Product Name</label>
                                        <input
                                            type="text"
                                            {...register('name')}
                                            placeholder="e.g. Wireless Noise Cancelling Headphones"
                                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
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
                                                <option value="" className="bg-neutral-900 text-neutral-500">Select a category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id} className="bg-neutral-900 text-white">
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                        {errors.category && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.category.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Brand</label>
                                            <input
                                                type="text"
                                                {...register('brand')}
                                                placeholder="e.g. Sony, Apple"
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Color</label>
                                            <input
                                                type="text"
                                                {...register('color')}
                                                placeholder="e.g. Black, White"
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Price (VND)</label>

                                            {/* Custom Controller for Formatted Price - Assuming CurrencyInput handles raw numbers */}
                                            <div className="relative">
                                                <Controller
                                                    name="price"
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
                                            </div>
                                            {errors.price && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.price.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Stock</label>
                                            <Controller
                                                name="stock"
                                                control={control}
                                                render={({ field: { onChange, value } }) => (
                                                    <CurrencyInput
                                                        value={value}
                                                        onValueChange={(val) => onChange(val ?? 0)}
                                                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all font-mono"
                                                        placeholder="0"
                                                        currencySymbol=""
                                                    />
                                                )}
                                            />
                                            {errors.stock && <p className="text-red-400 text-xs ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.stock.message}</p>}
                                        </div>
                                    </div>

                                    {/* Active Checkbox */}
                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            {...register('is_active')}
                                            className="w-4 h-4 rounded border-white/10 bg-black/20 text-purple-500 focus:ring-purple-500/50"
                                        />
                                        <label htmlFor="is_active" className="text-sm cursor-pointer select-none">Active Product</label>
                                    </div>
                                </div>

                                <div className="space-y-2 h-full">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Description</label>
                                    <textarea
                                        {...register('description')}
                                        className="w-full h-[calc(100%-2rem)] px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all resize-none min-h-[200px]"
                                        placeholder="Detailed description of your product..."
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6 border-t border-white/10 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    size="lg"
                                    className="w-full md:w-auto rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving Product...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Create Product
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}