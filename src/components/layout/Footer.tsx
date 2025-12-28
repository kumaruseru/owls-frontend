'use client';

import Link from 'next/link';
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Send,
    MapPin,
    Mail,
    Phone,
    Youtube
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface SocialLinks {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    [key: string]: string | undefined;
}

interface SiteConfig {
    site_name: string;
    site_description: string;
    contact_email: string;
    phone_number: string;
    address: string;
    social_links: SocialLinks;
}

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [config, setConfig] = useState<SiteConfig>({
        site_name: 'OWLS',
        site_description: 'Kiến tạo phong cách sống số với những thiết bị công nghệ đỉnh cao. Tối giản, mạnh mẽ và độc bản.',
        contact_email: 'hello@owls.com',
        phone_number: '+84 999 999 999',
        address: '123 Tech Park, Saigon, Vietnam',
        social_links: {
            instagram: '#',
            twitter: '#',
            linkedin: '#',
            facebook: '#'
        }
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await api.get('/core/config/');
                // Merge with defaults to ensure no broken UI if fields are missing
                setConfig(prev => ({
                    ...prev,
                    ...response.data,
                    social_links: response.data.social_links || prev.social_links
                }));
            } catch (error) {
                console.error("Failed to fetch footer config", error);
            }
        };

        fetchConfig();
    }, []);

    return (
        <footer className="relative bg-black text-white border-t border-white/10 overflow-hidden font-sans">
            {/* Decorative gradient blur */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-purple-900/5 blur-[100px] pointer-events-none -z-10"></div>

            <div className="container mx-auto px-4 pt-20 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

                    {/* 1. Brand & Newsletter (Chiếm 4 cột) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <Link href="/" className="inline-block">
                            <span className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                {config.site_name}.
                            </span>
                        </Link>
                        <p className="text-neutral-400 text-base leading-relaxed max-w-sm">
                            {config.site_description}
                        </p>

                        <div className="mt-4">
                            <h5 className="text-sm font-bold uppercase tracking-wider mb-3 text-white">Subscribe to newsletter</h5>
                            <div className="flex gap-2 relative max-w-sm">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600"
                                />
                                <button className="absolute right-1.5 top-1.5 bg-white text-black p-1.5 rounded-full hover:bg-purple-400 transition-colors">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. Links Columns (Chiếm 8 cột còn lại) */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">

                        {/* Column 1: Shop */}
                        <div>
                            <h4 className="font-bold text-white mb-6">Shop</h4>
                            <ul className="space-y-4 text-neutral-400 text-sm">
                                <li><Link href="/products/new" className="hover:text-purple-400 transition-colors">New Arrivals</Link></li>
                                <li><Link href="/products/laptops" className="hover:text-purple-400 transition-colors">Workstations</Link></li>
                                <li><Link href="/products/audio" className="hover:text-purple-400 transition-colors">Audio Gear</Link></li>
                                <li><Link href="/products/accessories" className="hover:text-purple-400 transition-colors">Accessories</Link></li>
                            </ul>
                        </div>

                        {/* Column 2: Support */}
                        <div>
                            <h4 className="font-bold text-white mb-6">Support</h4>
                            <ul className="space-y-4 text-neutral-400 text-sm">
                                <li><Link href="/help" className="hover:text-purple-400 transition-colors">Help Center</Link></li>
                                <li><Link href="/shipping" className="hover:text-purple-400 transition-colors">Shipping Status</Link></li>
                                <li><Link href="/warranty" className="hover:text-purple-400 transition-colors">Warranty</Link></li>
                                <li><Link href="/returns" className="hover:text-purple-400 transition-colors">Returns</Link></li>
                            </ul>
                        </div>

                        {/* Column 3: Company */}
                        <div>
                            <h4 className="font-bold text-white mb-6">Company</h4>
                            <ul className="space-y-4 text-neutral-400 text-sm">
                                <li><Link href="/about" className="hover:text-purple-400 transition-colors">Our Story</Link></li>
                                <li><Link href="/careers" className="hover:text-purple-400 transition-colors">Careers</Link></li>
                                <li><Link href="/blog" className="hover:text-purple-400 transition-colors">Journal</Link></li>
                                <li><Link href="/contact" className="hover:text-purple-400 transition-colors">Contact</Link></li>
                            </ul>
                        </div>

                        {/* Column 4: Contact Info */}
                        <div>
                            <h4 className="font-bold text-white mb-6">Contact</h4>
                            <ul className="space-y-4 text-neutral-400 text-sm">
                                {config.address && (
                                    <li className="flex items-start gap-3">
                                        <MapPin size={18} className="text-purple-400 shrink-0 mt-0.5" />
                                        <span>{config.address}</span>
                                    </li>
                                )}
                                {config.contact_email && (
                                    <li className="flex items-center gap-3">
                                        <Mail size={18} className="text-purple-400 shrink-0" />
                                        <a href={`mailto:${config.contact_email}`} className="hover:text-white">{config.contact_email}</a>
                                    </li>
                                )}
                                {config.phone_number && (
                                    <li className="flex items-center gap-3">
                                        <Phone size={18} className="text-purple-400 shrink-0" />
                                        <a href={`tel:${config.phone_number}`} className="hover:text-white">{config.phone_number}</a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-neutral-500 text-sm">
                        © {currentYear} {config.site_name} INC. All rights reserved.
                    </p>

                    {/* Social Icons */}
                    <div className="flex items-center gap-6">
                        {config.social_links.instagram && (
                            <a href={config.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white hover:scale-110 transition-all"><Instagram size={20} /></a>
                        )}
                        {config.social_links.twitter && (
                            <a href={config.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white hover:scale-110 transition-all"><Twitter size={20} /></a>
                        )}
                        {config.social_links.linkedin && (
                            <a href={config.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white hover:scale-110 transition-all"><Linkedin size={20} /></a>
                        )}
                        {config.social_links.facebook && (
                            <a href={config.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white hover:scale-110 transition-all"><Facebook size={20} /></a>
                        )}
                        {config.social_links.youtube && (
                            <a href={config.social_links.youtube} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white hover:scale-110 transition-all"><Youtube size={20} /></a>
                        )}
                    </div>

                    {/* Legal Links */}
                    <div className="flex gap-6 text-sm text-neutral-500">
                        <Link href="/privacy" className="hover:text-neutral-300 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-neutral-300 transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
