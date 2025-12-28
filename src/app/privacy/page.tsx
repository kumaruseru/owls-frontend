'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, Lock, Eye, FileText, Server } from 'lucide-react';
import { useRef } from 'react';

export default function PrivacyPage() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    const sections = [
        {
            title: "1. Thu thập thông tin",
            icon: <Eye className="text-purple-400" size={24} />,
            content: "Chúng tôi thu thập thông tin cá nhân mà bạn cung cấp trực tiếp cho chúng tôi khi bạn tạo tài khoản, thực hiện giao dịch, hoặc liên hệ với bộ phận hỗ trợ. Các thông tin này bao gồm tên, địa chỉ email, số điện thoại, địa chỉ giao hàng và thông tin thanh toán."
        },
        {
            title: "2. Sử dụng thông tin",
            icon: <FileText className="text-blue-400" size={24} />,
            content: "Thông tin của bạn được sử dụng để: \n- Xử lý đơn hàng và thanh toán.\n- Cải thiện trải nghiệm mua sắm và cá nhân hóa dịch vụ.\n- Gửi thông báo về các ưu đãi, cập nhật sản phẩm (nếu bạn đồng ý nhận tin).\n- Ngăn chặn các hành vi gian lận và đảm bảo an ninh hệ thống."
        },
        {
            title: "3. Bảo mật dữ liệu",
            icon: <Lock className="text-rose-400" size={24} />,
            content: "Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn bằng các biện pháp an ninh kỹ thuật và vật lý phù hợp. Dữ liệu thanh toán được mã hóa theo tiêu chuẩn an toàn công nghiệp và không bao giờ được lưu trữ trực tiếp trên máy chủ của chúng tôi."
        },
        {
            title: "4. Chia sẻ thông tin",
            icon: <Server className="text-emerald-400" size={24} />,
            content: "Chúng tôi không bán, trao đổi, hoặc chuyển giao thông tin cá nhân của bạn cho bên thứ ba, ngoại trừ các đối tác cung cấp dịch vụ tin cậy (như đơn vị vận chuyển, cổng thanh toán) những người hỗ trợ chúng tôi vận hành trang web và phục vụ bạn, miễn là các bên này cam kết bảo mật thông tin."
        }
    ];

    return (
        <div ref={targetRef} className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full opacity-40">
                    <></>
                </AuroraBackground>
            </div>

            <div className="relative z-10 w-full pb-20">
                {/* Hero Section */}
                <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center px-4 overflow-hidden border-b border-white/5">
                    <motion.div style={{ opacity, scale }} className="text-center relative z-20 max-w-4xl mx-auto">


                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg shadow-purple-900/20">
                                <Shield className="text-purple-400" size={32} />
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
                            Chính sách Bảo mật
                        </h1>
                        <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            Chúng tôi trân trọng sự tin tưởng của bạn và cam kết bảo vệ thông tin cá nhân của bạn một cách nghiêm ngặt nhất.
                        </p>
                    </motion.div>
                </section>

                {/* Content Section */}
                <section className="container mx-auto max-w-4xl px-4 -mt-10 relative z-20">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl space-y-12">

                        <div className="prose prose-invert prose-lg max-w-none">
                            <p className="text-neutral-300 text-lg leading-relaxed">
                                Chính sách bảo mật này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng dịch vụ của chúng tôi. Bằng việc truy cập hoặc sử dụng trang web, bạn đồng ý với các điều khoản được mô tả trong chính sách này.
                            </p>
                        </div>

                        <div className="grid gap-8">
                            {sections.map((section, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white/5 border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-start gap-4 md:gap-6">
                                        <div className="shrink-0 mt-1">
                                            {section.icon}
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-xl md:text-2xl font-display font-bold text-white">{section.title}</h2>
                                            <div className="text-neutral-400 leading-relaxed whitespace-pre-line">
                                                {section.content}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-white/10 text-center">
                            <p className="text-neutral-500 text-sm">
                                Cập nhật lần cuối: <span className="text-neutral-300 font-mono">28/12/2025</span>
                            </p>
                            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
                                <Link href="/contact">
                                    <Button size="lg" variant="outline" className="rounded-xl border-white/10 hover:bg-white/10 text-white min-w-[200px]">
                                        Liên hệ bộ phận Dữ liệu
                                    </Button>
                                </Link>
                                <Link href="/terms">
                                    <Button size="lg" className="rounded-xl bg-white text-black hover:bg-neutral-200 min-w-[200px]">
                                        Xem Điều khoản Sử dụng
                                    </Button>
                                </Link>
                            </div>
                        </div>

                    </div>
                </section>
            </div>
        </div>
    );
}
