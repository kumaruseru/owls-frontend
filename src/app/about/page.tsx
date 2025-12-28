'use client';

import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles, Target, Heart, ShieldCheck, Zap, Award, ArrowRight } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import api from '@/lib/api';
import { TeamMember } from '@/types/core';

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

export default function AboutPage() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await api.get('/core/team/');
                setTeamMembers(response.data.results || response.data);
            } catch (error) {
                console.error('Failed to fetch team members', error);
            }
        };
        fetchTeam();
    }, []);

    return (
        <div ref={targetRef} className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">
            {/* Background */}
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
                            <span>Since 2025</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="text-5xl md:text-8xl font-display font-bold mb-8 tracking-tight leading-[1.1] bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent"
                        >
                            Nghệ thuật của <br className="hidden md:block" /> sự tối giản.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="text-lg md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
                        >
                            Chúng tôi tái định nghĩa trải nghiệm tối giản bằng sự kết hợp hoàn hảo giữa công nghệ và trải nghiệm người dùng.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.6 }}
                        >
                            <Link href="/products">
                                <Button size="xl" className="rounded-full h-14 px-10 text-base bg-white text-black hover:bg-neutral-200 transition-all hover:scale-105 font-bold shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]">
                                    Khám phá Bộ sưu tập
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
                        <span className="text-[10px] uppercase tracking-widest">Cuộn xuống</span>
                    </motion.div>
                </section>

                {/* 2. MARQUEE PARTNERS */}
                <section className="py-12 border-y border-white/5 bg-black/50 backdrop-blur-sm overflow-hidden whitespace-nowrap relative z-20">
                    <div className="flex relative">
                        <motion.div className="flex gap-20 items-center px-10" variants={marqueeVariants} animate="animate">
                            {/* Duplicate items for seamless loop */}
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex gap-20 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500 min-w-max">
                                    {["Sony", "Bose", "Sennheiser", "Bang & Olufsen", "Marshall", "JBL", "Harman Kardon", "Devialet", "Apple", "Beats", "Samsung", "Asus", "Lenovo", "Dell", "Acer", "HP", "Logitech"].map((brand, idx) => (
                                        <span key={`${i}-${idx}`} className="text-2xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-neutral-600 to-neutral-400 hover:from-white hover:to-white cursor-pointer select-none transition-colors">
                                            {brand.toUpperCase()}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* 3. CORE VALUES GRID */}
                <section className="py-32 px-4 relative z-20 bg-black">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Giá trị cốt lõi</h2>
                            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">Điều gì tạo nên sự khác biệt của chúng tôi trong thế giới công nghệ?</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Target className="text-purple-400" size={32} />,
                                    title: "Tầm nhìn",
                                    desc: "Trở thành biểu tượng tiên phong trong việc định hình phong cách mua sắm thiết bị công nghệ."
                                },
                                {
                                    icon: <Heart className="text-rose-400" size={32} />,
                                    title: "Đam mê",
                                    desc: "Mỗi sản phẩm là kết tinh của sự tỉ mỉ, niềm đam mê bất tận với công nghệ và sự hoàn hảo."
                                },
                                {
                                    icon: <ShieldCheck className="text-emerald-400" size={32} />,
                                    title: "Cam kết",
                                    desc: "Chất lượng không thỏa hiệp. Dịch vụ tận tâm. Chúng tôi đặt khách hàng làm trọng tâm của mọi trải nghiệm."
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2, duration: 0.8 }}
                                    className="bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm group hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/10"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4 font-display">{item.title}</h3>
                                    <p className="text-neutral-400 leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. JOURNEY TIMELINE (Split Layout) */}
                <section className="py-32 px-4 bg-white/[0.02] relative z-20 border-y border-white/5">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">

                            {/* Content Side */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-12 leading-tight">
                                    Hành trình <br /> <span className="text-purple-400">theo đuổi công nghệ.</span>
                                </h2>
                                <div className="space-y-12 border-l border-white/10 pl-10 relative">
                                    {[
                                        { year: "12/2025", title: "Khởi đầu", desc: "Thành lập tại Sài Gòn với sứ mệnh mang công nghệ và uy tín đến gần hơn với giới trẻ." },
                                        { year: "07/2026", title: "Mở rộng", desc: "Hợp tác chiến lược với các thương hiệu top đầu thế giới như Apple, Samsung." },
                                        { year: "Future", title: "Vươn xa", desc: "Xây dựng hệ sinh thái công nghệ thông minh và không gian trải nghiệm thực tế ảo." },
                                    ].map((item, i) => (
                                        <div key={i} className="relative group">
                                            <span className="absolute -left-[49px] top-1 w-4 h-4 rounded-full bg-black border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-125 transition-transform" />
                                            <span className="text-purple-400 font-bold font-mono text-lg mb-1 block">{item.year}</span>
                                            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                            <p className="text-neutral-400 leading-relaxed">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Image Side with Overlay Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="relative hidden md:block"
                            >
                                <div className="aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 relative group">
                                    <div className="absolute inset-0 bg-neutral-900">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-pulse transition-all duration-1000" />
                                        {/* Abstract/Tech Image Placeholder */}
                                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700 mix-blend-overlay" />
                                    </div>

                                    {/* Floating Award Card */}
                                    <div className="absolute bottom-10 left-10 right-10 z-20">
                                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
                                            <div className="flex gap-4 items-center mb-4">
                                                <div className="p-3 bg-white text-black rounded-full shadow-lg">
                                                    <Award size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-lg">Giải thưởng Sáng tạo</p>
                                                    <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">Tech Excellence 2025</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-neutral-300 leading-relaxed italic">
                                                "Được vinh danh vì những đóng góp đột phá trong việc nâng cao trải nghiệm người dùng."
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* 5. TEAM & LEADERSHIP */}
                <section className="py-32 px-4 relative z-20 bg-black">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Đội ngũ lãnh đạo</h2>
                            <p className="text-neutral-400">Những người đứng sau tầm nhìn.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {teamMembers.length > 0 ? (
                                teamMembers.map((member, i) => (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.2 }}
                                        className="group relative"
                                    >
                                        <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 relative">
                                            {member.image ? (
                                                <img src={member.image} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                                                    <span className="text-neutral-500">No Image</span>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

                                            <div className="absolute bottom-6 left-6 z-10 transition-transform duration-300 group-hover:-translate-y-2">
                                                <h3 className="text-xl font-bold text-white">{member.name}</h3>
                                                <p className="text-purple-400 font-mono text-sm uppercase tracking-wide">{member.role}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-neutral-500 py-10">
                                    <p>Đang cập nhật...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 6. STATS (Glassmorphism) */}
                <section className="py-20 px-4 relative z-20">
                    <div className="container mx-auto max-w-6xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden backdrop-blur-xl"
                        >
                            {/* Decorative background gradients */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
                                {[
                                    { number: "5K+", label: "Khách hàng hài lòng" },
                                    { number: "20+", label: "Quốc gia & Vùng lãnh thổ" },
                                    { number: "100%", label: "Chính hãng & Bảo hành" },
                                    { number: "24/7", label: "Hỗ trợ kỹ thuật" },
                                ].map((stat, idx) => (
                                    <div key={idx} className="space-y-4">
                                        <p className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">{stat.number}</p>
                                        <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 7. CTA */}
                <section className="py-32 px-4 text-center relative z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="container mx-auto max-w-3xl"
                    >
                        <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8">Sẵn sàng nâng tầm <br /> trải nghiệm?</h2>
                        <p className="text-neutral-400 text-xl mb-12 max-w-xl mx-auto">Tham gia cộng đồng hàng nghìn người yêu âm thanh và khám phá bộ sưu tập độc quyền.</p>
                        <Link href="/products">
                            <Button size="xl" className="h-16 px-12 rounded-full bg-white text-black hover:bg-neutral-200 font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                                <Zap className="mr-2 fill-black" size={20} /> Mua sắm ngay <ArrowRight className="ml-2" />
                            </Button>
                        </Link>
                    </motion.div>
                </section>
            </div>
        </div>
    );
}