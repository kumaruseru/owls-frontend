'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Shield, Truck, Clock, Star, ShoppingBag, Zap, ChevronRight, Eye
} from 'lucide-react';
import api from '@/lib/api';
import { cn, formatPrice } from '@/lib/utils'; // Sử dụng utils chung nếu có

// --- TYPES ---
interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  current_price: number;
  primary_image: string | null;
  category: { name: string };
  rating?: number;
}

// --- SUB-COMPONENTS ---

const ProductCard = ({ product }: { product: Product }) => {
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
              {product.category.name}
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
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.current_price)}
            </span>
            {product.sale_price && (
              <span className="text-sm text-white/40 line-through decoration-white/20 font-mono">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const ProductSkeleton = () => (
  <div className="rounded-[2rem] border border-white/5 bg-white/5 p-3 h-[400px] animate-pulse">
    <div className="aspect-square w-full rounded-[1.5rem] bg-white/10 mb-4" />
    <div className="px-2 space-y-3">
      <div className="h-3 w-1/3 bg-white/10 rounded-full" />
      <div className="h-6 w-3/4 bg-white/10 rounded-full" />
      <div className="h-6 w-1/2 bg-white/10 rounded-full mt-4" />
    </div>
  </div>
);

// --- MAIN PAGE ---

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/products/featured/');
        setFeaturedProducts(response.data.results || response.data);
      } catch (error) {
        console.error('Failed to fetch featured products', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans">

      {/* 1. Hero Section */}
      <AuroraBackground className="h-[100vh] z-0">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center justify-center gap-8 px-4 text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="group relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-purple-200 backdrop-blur-xl transition-colors hover:bg-white/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            OWLS Ecosystem 2025
          </motion.div>

          {/* Heading */}
          <h1 className="text-6xl sm:text-7xl md:text-9xl font-display font-bold tracking-tighter leading-[0.9]">
            <span className="block bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
              Future of
            </span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Personal Tech.
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl font-light leading-relaxed text-neutral-400">
            Khám phá bộ sưu tập công nghệ đỉnh cao. <br className="hidden md:block" />
            Từ hiệu suất Workstation đến sự tinh tế của Wearables.
          </p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4"
          >
            <Button size="xl" className="rounded-full h-14 px-8 text-base font-bold bg-white text-black hover:bg-neutral-200 transition-all hover:scale-105 shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)]" asChild>
              <Link href="/products">
                Shop Collection <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="rounded-full h-14 px-8 text-base border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/40" asChild>
              <Link href="/about">Our Story</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-purple-500 to-transparent"></div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Scroll</span>
        </motion.div>
      </AuroraBackground>

      {/* 2. Featured Products */}
      <section className="relative py-32 border-b border-white/5 bg-black">
        <div className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-full overflow-hidden">
          <div className="absolute left-1/2 top-[20%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-900/20 blur-[120px]"></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row md:items-end border-b border-white/10 pb-8">
            <div className="w-full md:w-auto">
              <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-white mb-2">Trending Now</h2>
              <p className="text-lg text-neutral-400">Những thiết bị mới nhất vừa cập bến OWLS Store.</p>
            </div>
            <Link
              href="/products"
              className="group flex items-center text-sm font-bold uppercase tracking-widest text-white transition-colors hover:text-purple-400"
            >
              View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-32 text-center text-neutral-500 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                <p>Đang cập nhật sản phẩm...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Categories (Bento Grid) - FIXED */}
      <section className="relative border-y border-white/5 bg-black py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

        <div className="container mx-auto px-4">
          <h2 className="mb-20 text-center text-4xl md:text-6xl font-display font-bold tracking-tighter">
            Choose Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Weapon</span>
          </h2>

          <BentoGrid className="mx-auto max-w-6xl">
            {/* 1. WORKSTATIONS - Card Lớn */}
            <div className="md:col-span-2 row-span-1 rounded-3xl group relative overflow-hidden border border-white/10 bg-white/5 hover:border-purple-500/30 transition-colors">
              <Link href="/products?category=laptop" className="absolute inset-0 z-20 focus:outline-none"></Link>
              <div className="group relative h-full w-full overflow-hidden rounded-3xl bg-neutral-900">
                {/* Layer 1: Image - z-0 */}
                <Image
                  src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2670&auto=format&fit=crop"
                  alt="Laptop"
                  fill
                  className="object-cover opacity-80 transition-all duration-700 group-hover:scale-[1.2] group-hover:opacity-60 z-0 scale-[1.15] translate-y-4"
                />
                {/* Layer 2: Gradient - z-10 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80" />

                {/* Layer 3: Text - z-20 */}
                <div className="absolute bottom-5 left-6 z-20 transition-transform duration-500 group-hover:-translate-y-2 pr-8">
                  <h3 className="text-3xl font-display font-bold text-white mb-2">Workstations</h3>
                  <p className="text-sm text-neutral-300 leading-relaxed max-w-md">Hiệu năng xử lý tối thượng cho Creator chuyên nghiệp.</p>
                </div>
              </div>
            </div>

            {/* 2. PHONES - Card Nhỏ */}
            <div className="md:col-span-1 row-span-1 rounded-3xl group relative overflow-hidden border border-white/10 bg-white/5 hover:border-blue-500/30 transition-colors">
              <Link href="/products?category=phone" className="absolute inset-0 z-20 focus:outline-none"></Link>
              <div className="group relative h-full w-full overflow-hidden rounded-3xl bg-neutral-900">
                <Image
                  src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=2574&auto=format&fit=crop"
                  alt="Smartphone"
                  fill
                  className="object-cover opacity-80 transition-all duration-700 group-hover:scale-[1.2] group-hover:opacity-60 z-0 scale-[1.15] translate-y-4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                <div className="absolute bottom-5 left-6 z-20 transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="text-3xl font-display font-bold text-white mb-2">Phones</h3>
                  <p className="text-sm text-neutral-300">Công nghệ trên tay.</p>
                </div>
              </div>
            </div>

            {/* 3. AUDIO - Card Nhỏ */}
            <div className="md:col-span-1 row-span-1 rounded-3xl group relative overflow-hidden border border-white/10 bg-white/5 hover:border-pink-500/30 transition-colors">
              <Link href="/products?category=audio" className="absolute inset-0 z-20 focus:outline-none"></Link>
              <div className="group relative h-full w-full overflow-hidden rounded-3xl bg-neutral-900">
                <Image
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop"
                  alt="Headphones"
                  fill
                  className="object-cover opacity-80 transition-all duration-700 group-hover:scale-[1.2] group-hover:opacity-60 z-0 scale-[1.15] translate-y-4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                <div className="absolute bottom-5 left-6 z-20 transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="text-3xl font-display font-bold text-white mb-2">Audio</h3>
                  <p className="text-sm text-neutral-300">Âm thanh chuẩn studio.</p>
                </div>
              </div>
            </div>

            {/* 4. WEARABLES - Card Lớn */}
            <div className="md:col-span-2 row-span-1 rounded-3xl group relative overflow-hidden border border-white/10 bg-white/5 hover:border-green-500/30 transition-colors">
              <Link href="/products?category=watch" className="absolute inset-0 z-20 focus:outline-none"></Link>
              <div className="group relative h-full w-full overflow-hidden rounded-3xl bg-neutral-900">
                <Image
                  src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=2672&auto=format&fit=crop"
                  alt="Smart Watch"
                  fill
                  className="object-cover opacity-80 transition-all duration-700 group-hover:scale-[1.2] group-hover:opacity-60 z-0 scale-[1.15] translate-y-4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                <div className="absolute bottom-5 left-6 z-20 transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="text-3xl font-display font-bold text-white mb-2">Wearables</h3>
                  <p className="text-sm text-neutral-300">Kết nối & Sức khỏe.</p>
                </div>
              </div>
            </div>
          </BentoGrid>
        </div>
      </section>

      {/* 4. Why Choose Us */}
      <section className="container mx-auto px-4 py-32">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Truck,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10',
              border: 'group-hover:border-purple-500/50',
              title: 'Global Shipping',
              desc: 'Vận chuyển miễn phí toàn quốc cho đơn hàng trên 5.000.000đ. Đóng gói bảo mật.'
            },
            {
              icon: Shield,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              border: 'group-hover:border-blue-500/50',
              title: 'Official Warranty',
              desc: 'Bảo hành chính hãng 12 tháng. 1 đổi 1 trong 30 ngày nếu có lỗi nhà sản xuất.'
            },
            {
              icon: Clock,
              color: 'text-pink-400',
              bg: 'bg-pink-500/10',
              border: 'group-hover:border-pink-500/50',
              title: '24/7 Support',
              desc: 'Đội ngũ chuyên gia kỹ thuật sẵn sàng hỗ trợ bất cứ lúc nào bạn cần.'
            }
          ].map((feature, idx) => (
            <div key={idx} className={cn("group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-10 transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:shadow-2xl", feature.border)}>
              <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${feature.bg} ${feature.color} border border-white/5 transition-transform group-hover:scale-110`}>
                <feature.icon size={32} />
              </div>
              <h3 className="mb-4 text-xl font-bold font-display text-white">{feature.title}</h3>
              <p className="text-base leading-relaxed text-neutral-400">{feature.desc}</p>

              {/* Decorative Corner */}
              <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full ${feature.bg} blur-[60px] opacity-20 transition-all duration-700 group-hover:opacity-40`}></div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA / Newsletter */}
      <section className="relative py-32 border-t border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-purple-900/10 blur-[120px] -z-10"></div>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-bold uppercase tracking-widest text-white mb-8 backdrop-blur-md">
              <Zap size={14} className="text-yellow-400 fill-yellow-400" /> Exclusive Offer
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight text-white leading-tight">
              Ready to elevate <br /> your experience?
            </h2>
            <p className="text-lg text-neutral-400 mb-12 max-w-xl mx-auto leading-relaxed">
              Gia nhập cộng đồng OWLS và nhận ngay ưu đãi 10% cho đơn hàng đầu tiên của bạn.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="xl" className="rounded-full px-12 h-14 bg-white text-black font-bold text-lg hover:bg-neutral-200 w-full sm:w-auto shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105" asChild>
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button size="xl" variant="outline" className="rounded-full px-12 h-14 border-white/20 bg-white/5 text-white font-medium hover:bg-white/10 w-full sm:w-auto backdrop-blur-md" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}