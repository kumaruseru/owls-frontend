import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { X, Phone, Mail, Building2, User, FileText, Send, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface B2BContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName?: string;
    quantity?: number;
}

export function B2BContactModal({ isOpen, onClose, productName, quantity }: B2BContactModalProps) {
    const [formData, setFormData] = useState({
        companyName: '',
        customerName: '',
        phone: '',
        email: '',
        note: '',
        quantity: quantity || 6,
        acceptPromo: true
    });

    useEffect(() => {
        if (quantity) {
            setFormData(prev => ({ ...prev, quantity: quantity }));
        }
    }, [quantity]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        console.log("Submitting B2B Request:", formData);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setIsSuccess(false);
            setFormData({
                companyName: '',
                customerName: '',
                phone: '',
                email: '',
                note: '',
                quantity: quantity || 6,
                acceptPromo: true
            });
        }, 500);
    }

    const adjustQuantity = (delta: number) => {
        setFormData(prev => {
            const newQty = Math.max(1, prev.quantity + delta);
            return { ...prev, quantity: newQty };
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            {/* 
                Fixed Layout: 
                - flex flex-col: Stacks header and body vertically
                - max-h-[95vh]: Limits height to 95% of viewport
                - overflow-hidden: Prevents outer scroll
            */}
            <DialogContent className="sm:max-w-2xl bg-black/90 border-white/10 text-white backdrop-blur-xl p-0 gap-0 shadow-2xl shadow-purple-500/10 flex flex-col max-h-[95vh] overflow-hidden">

                {/* Header - Fixed at top (flex-none) */}
                <div className="p-6 border-b border-white/10 bg-white/5 relative overflow-hidden flex-none">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                            <Building2 className="text-purple-400" /> B2B / Enterprise Inquiry
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Bulk order request for <span className="text-white font-medium">{productName || 'products'}</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Content - Scrollable (flex-1 overflow-y-auto) */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center py-12 text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_-5px_rgba(74,222,128,0.3)]">
                                    <Send size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-white">Request Sent Successfully!</h3>
                                    <p className="text-neutral-400 max-w-md mx-auto">
                                        We have received your request for <span className="text-white font-bold">{formData.quantity} units</span>. <br />
                                        Our B2B team will contact you shortly.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleClose}
                                    size="lg"
                                    className="mt-4 bg-white text-black hover:bg-neutral-200 font-bold px-8 rounded-xl"
                                >
                                    Done
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-8"
                            >
                                {/* Info Banner */}
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-4 items-start">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
                                        <FileText size={18} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-blue-300 uppercase tracking-wider">Quantity Threshold reached</h4>
                                        <p className="text-sm text-blue-200/70 leading-relaxed">
                                            For orders exceeding <strong>5 units</strong>, we offer special B2B pricing. You can adjust the quantity below.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">

                                    {/* Product and Quantity Row (Featured) */}
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row gap-6 items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">Inquiry for Product</p>
                                            <p className="font-display font-bold text-white text-lg line-clamp-1">{productName || 'Selected Product'}</p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mr-2">Quantity:</p>
                                            <div className="flex items-center bg-black/40 border border-white/10 rounded-lg h-10">
                                                <button
                                                    type="button"
                                                    onClick={() => adjustQuantity(-1)}
                                                    className="w-10 h-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={formData.quantity}
                                                    onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 0) })}
                                                    className="w-16 h-full bg-transparent border-x border-white/10 text-center font-mono font-bold text-white focus:outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => adjustQuantity(1)}
                                                    className="w-10 h-full flex items-center justify-center hover:bg-white/10 text-white transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <Label htmlFor="companyName" className="text-xs font-bold uppercase tracking-widest text-neutral-500">Company Name <span className="text-red-400">*</span></Label>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                                                <Input
                                                    id="companyName"
                                                    placeholder="Acme Corp"
                                                    className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 h-12 rounded-xl transition-all"
                                                    required
                                                    value={formData.companyName}
                                                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <Label htmlFor="customerName" className="text-xs font-bold uppercase tracking-widest text-neutral-500">Contact Person <span className="text-red-400">*</span></Label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                                                <Input
                                                    id="customerName"
                                                    placeholder="John Doe"
                                                    className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 h-12 rounded-xl transition-all"
                                                    required
                                                    value={formData.customerName}
                                                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-neutral-500">Phone Number <span className="text-red-400">*</span></Label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                                                <Input
                                                    id="phone"
                                                    placeholder="+84 90 123 4567"
                                                    className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 h-12 rounded-xl transition-all"
                                                    required
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-neutral-500">Email Address <span className="text-red-400">*</span></Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-purple-400 transition-colors" size={16} />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="john@acme.com"
                                                    className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 h-12 rounded-xl transition-all"
                                                    required
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <Label htmlFor="note" className="text-xs font-bold uppercase tracking-widest text-neutral-500">Additional Notes</Label>
                                        <Textarea
                                            id="note"
                                            placeholder="Specific requirements, preferred delivery date, etc."
                                            className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:bg-white/10 rounded-xl resize-none p-4"
                                            value={formData.note}
                                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex items-start space-x-3 pt-2">
                                        <Checkbox
                                            id="promo"
                                            checked={formData.acceptPromo}
                                            onCheckedChange={(checked) => setFormData({ ...formData, acceptPromo: checked as boolean })}
                                            className="mt-1 border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 bg-white/5"
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label
                                                htmlFor="promo"
                                                className="text-sm font-medium leading-none text-neutral-300 cursor-pointer hover:text-white transition-colors"
                                            >
                                                Send me updates about B2B offers
                                            </Label>
                                            <p className="text-[11px] text-neutral-500">
                                                We promise not to spam your inbox.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        size="xl"
                                        className="w-full h-14 bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-widest text-sm rounded-xl shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] transition-all"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">Processing...</span>
                                        ) : (
                                            <span className="flex items-center gap-2">Submit Request <Send size={16} /></span>
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
