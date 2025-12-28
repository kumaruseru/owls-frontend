'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, AlertCircle, RefreshCw, Scale, Gavel } from 'lucide-react';
import { useRef } from 'react';

export default function TermsPage() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    const termsSections = [
        {
            title: "1. Chấp thuận điều khoản",
            icon: <Gavel className="text-purple-400" size={24} />,
            content: "Bằng việc truy cập và sử dụng trang web này, bạn đồng ý tuân thủ các Điều khoản sử dụng này, tất cả các luật và quy định hiện hành. Nếu bạn không đồng ý với bất kỳ điều khoản nào, bạn bị cấm sử dụng hoặc truy cập trang web này."
        },
        {
            title: "2. Giấy phép sử dụng",
            icon: <BookOpen className="text-blue-400" size={24} />,
            content: "Quyền được cấp để tải xuống tạm thời một bản sao của tài liệu (thông tin hoặc phần mềm) trên trang web của chúng tôi chỉ cho mục đích xem cá nhân, phi thương mại. Đây là sự cấp phép, không phải chuyển nhượng quyền sở hữu."
        },
        {
            title: "3. Từ chối trách nhiệm",
            icon: <AlertCircle className="text-rose-400" size={24} />,
            content: "Tài liệu trên trang web của chúng tôi được cung cấp 'nguyên trạng'. Chúng tôi không đưa ra bảo đảm, dù rõ ràng hay ngụ ý, và theo đây từ chối tất cả các bảo đảm khác bao gồm, không giới hạn, các bảo đảm ngụ ý hoặc điều kiện về khả năng bán được, tính phù hợp cho một mục đích cụ thể."
        },
        {
            title: "4. Thay đổi chính sách",
            icon: <RefreshCw className="text-emerald-400" size={24} />,
            content: "Chúng tôi có thể sửa đổi các điều khoản sử dụng này cho trang web của mình bất cứ lúc nào mà không cần thông báo trước. Bằng cách sử dụng trang web này, bạn đồng ý bị ràng buộc bởi phiên bản hiện tại của các Điều khoản sử dụng này."
        },
        {
            title: "5. Luật áp dụng",
            icon: <Scale className="text-amber-400" size={24} />,
            content: "Mọi khiếu nại liên quan đến trang web của chúng tôi sẽ được điều chỉnh bởi luật pháp của Việt Nam mà không liên quan đến các xung đột về các quy định pháp luật."
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
                            <div className="p-3 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg shadow-blue-900/20">
                                <Scale className="text-blue-400" size={32} />
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
                            Điều khoản Sử dụng
                        </h1>
                        <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            Quy định về việc sử dụng dịch vụ và trách nhiệm pháp lý giữa chúng tôi và khách hàng.
                        </p>
                    </motion.div>
                </section>

                {/* Content Section */}
                <section className="container mx-auto max-w-4xl px-4 -mt-10 relative z-20">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl space-y-12">

                        <div className="prose prose-invert prose-lg max-w-none">
                            <p className="text-neutral-300 text-lg leading-relaxed">
                                Chào mừng bạn đến với trang web của chúng tôi. Nếu bạn tiếp tục duyệt và sử dụng trang web này, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sử dụng sau đây.
                            </p>
                        </div>

                        <div className="grid gap-8">
                            {termsSections.map((section, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white/5 border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-white/10 transition-colors group"
                                >
                                    <div className="flex items-start gap-4 md:gap-6">
                                        <div className="shrink-0 mt-1 transition-transform group-hover:scale-110 duration-300">
                                            {section.icon}
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-xl md:text-2xl font-display font-bold text-white group-hover:text-blue-200 transition-colors">{section.title}</h2>
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
                                Hiệu lực từ: <span className="text-neutral-300 font-mono">01/01/2026</span>
                            </p>
                            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
                                <Link href="/privacy">
                                    <Button size="lg" variant="outline" className="rounded-xl border-white/10 hover:bg-white/10 text-white min-w-[200px]">
                                        Xem Chính sách Bảo mật
                                    </Button>
                                </Link>
                                <Link href="/contact">
                                    <Button size="lg" className="rounded-xl bg-white text-black hover:bg-neutral-200 min-w-[200px]">
                                        Liên hệ hỗ trợ
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
