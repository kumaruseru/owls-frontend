'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Shield, Truck, Clock, Star, ShoppingBag, Zap, Award, Sparkles
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// --- TYPES ---
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  current_price: number;
  primary_image: string | null;
  category: { name: string };
  rating?: number;
}

// --- ANIMATION VARIANTS ---
const marqueeVariants: Variants = {
  animate: {
    x: ["0%", "-50%"],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 25,
        ease: "linear",
      },
    },
  },
};

// --- SUB-COMPONENTS ---

const ProductCard = ({ product }: { product: Product }) => {
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <Link href={`/products/${product.slug}`} className="group relative block h-full">
      <div className="relative h-full flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 transition-all duration-500 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-2 backdrop-blur-sm">

        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black/20 border border-white/5">
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
            <button className="w-full h-10 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-lg text-xs uppercase tracking-wide">
              <ShoppingBag size={14} /> Quick View
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
              {product.category.name}
            </span>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-bold text-white/60">{product.rating || '5.0'}</span>
            </div>
          </div>

          <h3 className="line-clamp-2 font-display text-lg font-bold text-white leading-snug mb-3 group-hover:text-purple-300 transition-colors">
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
  <div className="rounded-3xl border border-white/5 bg-white/5 p-4 h-[400px] animate-pulse">
    <div className="aspect-square w-full rounded-2xl bg-white/10 mb-4" />
    <div className="space-y-3">
      <div className="h-3 w-1/3 bg-white/10 rounded-full" />
      <div className="h-6 w-3/4 bg-white/10 rounded-full" />
      <div className="h-6 w-1/2 bg-white/10 rounded-full mt-4" />
    </div>
  </div>
);

// --- MAIN PAGE ---

export default function HomePage() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Fetch latest products to ensure "Trending/New" is always populated
        const response = await api.get('/catalog/products/?ordering=-created_at');
        const data = response.data.results || response.data;
        setFeaturedProducts(data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch featured products', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div ref={targetRef} className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">
      {/* Global Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AuroraBackground className="h-full w-full opacity-60">
          <></>
        </AuroraBackground>
      </div>

      <div className="relative z-10 w-full">

        {/* 1. HERO SECTION (Parallax) */}
        <section className="relative h-screen flex items-center justify-center px-4 overflow-hidden">
          <motion.div
            style={{ opacity, scale }}
            className="container mx-auto max-w-5xl text-center relative z-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-purple-300 mb-8 backdrop-blur-md shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)]"
            >
              <Sparkles size={14} />
              <span>Future Tech 2025</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-6xl sm:text-8xl md:text-9xl font-display font-bold mb-8 tracking-tighter leading-[0.9]"
            >
              <span className="block bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
                Define Your
              </span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                Reality.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-lg md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
            >
              Experience the pinnacle of personal technology. <br className="hidden md:block" /> From workstation power to wearable elegance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/products">
                <Button size="xl" className="rounded-full h-14 px-10 text-base bg-white text-black hover:bg-neutral-200 transition-all hover:scale-105 font-bold shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]">
                  Shop Collection <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="xl" variant="outline" className="rounded-full h-14 px-10 text-base border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/40 transition-all">
                  Our Story
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ duration: 2, delay: 1, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-neutral-500 flex flex-col items-center"
          >
            <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent mb-2" />
            <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          </motion.div>
        </section>

        {/* 2. MARQUEE BRANDS */}
        <section className="py-12 border-y border-white/5 bg-black/50 backdrop-blur-sm overflow-hidden whitespace-nowrap relative z-20">
          <div className="flex relative">
            <motion.div className="flex gap-20 items-center px-10" variants={marqueeVariants} animate="animate">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-20 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500 min-w-max">
                  {["Sony", "Bose", "Sennheiser", "Bang & Olufsen", "Marshall", "JBL", "Harman Kardon", "Devialet", "Apple", "Beats", "Samsung", "Asus", "Nvidia", "AMD", "Intel", "Razer", "Logitech"].map((brand, idx) => (
                    <span key={`${i}-${idx}`} className="text-2xl md:text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-neutral-600 to-neutral-400 hover:from-white hover:to-white cursor-pointer select-none transition-colors">
                      {brand.toUpperCase()}
                    </span>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 3. FEATURED PRODUCTS */}
        <section className="py-32 px-4 relative z-20">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row md:items-end border-b border-white/10 pb-8">
              <div className="w-full md:w-auto">
                <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-white mb-2">Trending Now</h2>
                <p className="text-lg text-neutral-400">The latest arrivals at OWLS Store.</p>
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
                  <p>Updating products...</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. BENTO CATEGORIES */}
        <section className="relative py-32 px-4 z-20">
          <div className="container mx-auto">
            <h2 className="mb-20 text-center text-4xl md:text-6xl font-display font-bold tracking-tighter">
              Choose Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Weapon</span>
            </h2>

            <BentoGrid className="mx-auto max-w-6xl">
              {/* 1. WORKSTATIONS - Large */}
              <div className="md:col-span-2 row-span-1 rounded-3xl group relative overflow-hidden border border-white/10 bg-white/5 hover:border-purple-500/30 transition-colors">
                <Link href="/products?category=laptops" className="absolute inset-0 z-20 focus:outline-none"></Link>
                <div className="group relative h-full w-full overflow-hidden rounded-3xl bg-neutral-900">
                  <Image
                    src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2670&auto=format&fit=crop"
                    alt="Laptop"
                    fill
                    className="object-cover opacity-80 transition-all duration-700 group-hover:scale-[1.1] group-hover:opacity-60 z-0"
                    sizes="(max-width: 768px) 100vw, 66vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                  <div className="absolute bottom-8 left-8 z-20 transition-transform duration-500 group-hover:-translate-y-2 pr-8">
                    <h3 className="text-3xl font-display font-bold text-white mb-2">Workstations</h3>
                    <p className="text-sm text-neutral-300 leading-relaxed max-w-md">Ultimate performance for professionals.</p>
                  </div>
                </div>
              </div>

              {/* 2. PHONES - Small */}
              <div className="md:col-span-1 row-span-1 rounded-3xl group relative overflow-hidden border border-white/10 bg-white/5 hover:border-blue-500/30 transition-colors">
                <Link href="/products?category=phones" className="absolute inset-0 z-20 focus:outline-none"></Link>
                <div className="group relative h-full w-full overflow-hidden rounded-3xl bg-neutral-900">
                  <Image
                    src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=2574&auto=format&fit=crop"
                    alt="Smartphone"
                    fill
                    className="object-cover opacity-80 transition-all duration-700 group-hover:scale-[1.1] group-hover:opacity-60 z-0"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                  <div className="absolute bottom-8 left-8 z-20 transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-3xl font-display font-bold text-white mb-2">Phones</h3>
                    <p className="text-sm text-neutral-300">Power in hand.</p>
                  </div>
                </div>
              </div>

              {/* 3. AUDIO - Small */}
              <div className="md:col-span-1 row-span-1 rounded-3xl group relative overflow-hidden border border-white/10 bg-white/5 hover:border-pink-500/30 transition-colors">
                <Link href="/products?category=audio" className="absolute inset-0 z-20 focus:outline-none"></Link>
                <div className="group relative h-full w-full overflow-hidden rounded-3xl bg-neutral-900">
                  <Image
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop"
                    alt="Headphones"
                    fill
                    className="object-cover opacity-80 transition-all duration-700 group-hover:scale-[1.1] group-hover:opacity-60 z-0"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                  <div className="absolute bottom-8 left-8 z-20 transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-3xl font-display font-bold text-white mb-2">Audio</h3>
                    <p className="text-sm text-neutral-300">Studio quality.</p>
                  </div>
                </div>
              </div>

              {/* 4. WEARABLES - Large */}
              <div className="md:col-span-2 row-span-1 rounded-3xl group relative overflow-hidden border border-white/10 bg-white/5 hover:border-green-500/30 transition-colors">
                <Link href="/products?category=watches" className="absolute inset-0 z-20 focus:outline-none"></Link>
                <div className="group relative h-full w-full overflow-hidden rounded-3xl bg-neutral-900">
                  <Image
                    src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=2672&auto=format&fit=crop"
                    alt="Smart Watch"
                    fill
                    className="object-cover opacity-80 transition-all duration-700 group-hover:scale-[1.1] group-hover:opacity-60 z-0"
                    sizes="(max-width: 768px) 100vw, 66vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                  <div className="absolute bottom-8 left-8 z-20 transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-3xl font-display font-bold text-white mb-2">Wearables</h3>
                    <p className="text-sm text-neutral-300">Connect & Health.</p>
                  </div>
                </div>
              </div>
            </BentoGrid>
          </div>
        </section>

        {/* 5. FEATURES */}
        <section className="container mx-auto px-4 py-32 relative z-20">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Truck,
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
                border: 'group-hover:border-purple-500/50',
                title: 'Global Shipping',
                desc: 'Free secure shipping on all orders over $500.'
              },
              {
                icon: Shield,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                border: 'group-hover:border-blue-500/50',
                title: 'Official Warranty',
                desc: '12-month direct manufacturer warranty.'
              },
              {
                icon: Clock,
                color: 'text-pink-400',
                bg: 'bg-pink-500/10',
                border: 'group-hover:border-pink-500/50',
                title: '24/7 Support',
                desc: 'Expert technical support whenever you need.'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className={cn("group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-10 transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:shadow-2xl backdrop-blur-sm", feature.border)}
              >
                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${feature.bg} ${feature.color} border border-white/5 transition-transform group-hover:scale-110 shadow-inner`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="mb-4 text-xl font-bold font-display text-white">{feature.title}</h3>
                <p className="text-base leading-relaxed text-neutral-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 6. CTA */}
        <section className="py-32 px-4 text-center relative z-20 border-t border-white/5 bg-gradient-to-t from-purple-900/10 to-transparent">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="container mx-auto max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-bold uppercase tracking-widest text-white mb-8 backdrop-blur-md">
              <Zap size={14} className="text-yellow-400 fill-yellow-400" /> Exclusive Offer
            </div>
            <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight text-white leading-tight">
              Ready to elevate <br /> your experience?
            </h2>
            <p className="text-lg text-neutral-400 mb-12 max-w-xl mx-auto leading-relaxed">
              Join the OWLS community and get 10% off your first order.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="xl" className="h-16 px-12 rounded-full bg-white text-black hover:bg-neutral-200 font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                  Shop Now <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}