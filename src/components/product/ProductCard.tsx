import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';

export const ProductCard = ({ product }: { product: Product }) => {
    const discount = product.sale_price
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0;

    return (
        <Link href={`/products/${product.slug}`} className="group relative block h-full">
            <div className="relative h-full flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 transition-all duration-500 hover:border-purple-500/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-900/20">

                {/* Image Container */}
                <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] bg-black/20 border border-white/5">
                    {product.primary_image ? (
                        <Image
                            src={product.primary_image}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/20 bg-neutral-900 text-xs uppercase tracking-widest">
                            No Image
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute left-3 top-3 flex flex-col gap-2 z-10">
                        {discount > 0 && (
                            <span className="inline-flex items-center rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-lg border border-white/10">
                                -{discount}%
                            </span>
                        )}
                    </div>

                    {/* Quick Action Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-20">
                        <button className="w-full h-11 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-lg text-sm">
                            <ShoppingBag size={16} /> Quick View
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-4 px-2 pb-2 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                            {product.category?.name}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={12} fill="currentColor" />
                            <span className="text-xs font-bold text-white/60">{product.rating || '5.0'}</span>
                        </div>
                    </div>

                    <h3 className="line-clamp-2 font-display text-lg font-bold text-white leading-tight mb-3 group-hover:text-purple-300 transition-colors">
                        {product.name}
                    </h3>

                    <div className="mt-auto flex items-baseline gap-2">
                        <span className="text-lg font-bold text-white font-mono">
                            {formatPrice(product.current_price)}
                        </span>
                        {product.sale_price && (
                            <span className="text-sm text-white/40 line-through decoration-white/20 font-mono">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};
