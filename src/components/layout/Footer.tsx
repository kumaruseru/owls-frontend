import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Send, 
  MapPin, 
  Mail, 
  Phone 
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
                OWLS.
              </span>
            </Link>
            <p className="text-neutral-400 text-base leading-relaxed max-w-sm">
              Kiến tạo phong cách sống số với những thiết bị công nghệ đỉnh cao. 
              Tối giản, mạnh mẽ và độc bản.
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
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-purple-400 shrink-0 mt-0.5" />
                  <span>123 Tech Park, Saigon, Vietnam</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-purple-400 shrink-0" />
                  <a href="mailto:hello@owls.com" className="hover:text-white">hello@owls.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-purple-400 shrink-0" />
                  <a href="tel:+84999999999" className="hover:text-white">+84 999 999 999</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-500 text-sm">
            © {currentYear} OWLS INC. All rights reserved.
          </p>
          
          {/* Social Icons */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-neutral-400 hover:text-white hover:scale-110 transition-all"><Instagram size={20} /></a>
            <a href="#" className="text-neutral-400 hover:text-white hover:scale-110 transition-all"><Twitter size={20} /></a>
            <a href="#" className="text-neutral-400 hover:text-white hover:scale-110 transition-all"><Linkedin size={20} /></a>
            <a href="#" className="text-neutral-400 hover:text-white hover:scale-110 transition-all"><Facebook size={20} /></a>
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