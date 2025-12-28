"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import {
    Eye, Search, Filter, ShoppingBag, Loader2,
    ChevronLeft, ChevronRight, MoreVertical, Copy,
    CheckCircle2, XCircle, Truck, Package as PackageIcon, RefreshCcw
} from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface Order {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    total: number;
    item_count: number;
    created_at: string;
    recipient_name: string;
}

// --- Constants ---
const STATUS_OPTIONS = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipping", label: "Shipping" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
    { value: "all", label: "All Payments" },
    { value: "paid", label: "Paid" },
    { value: "unpaid", label: "Unpaid" },
    { value: "refunded", label: "Refunded" },
];

// --- Components ---

const StatusBadge = ({ status, type = 'order' }: { status: string; type?: 'order' | 'payment' }) => {
    const s = status?.toLowerCase();

    let colorClass, icon;

    if (type === 'payment') {
        if (['paid'].includes(s)) { colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"; icon = <CheckCircle2 className="w-3 h-3 mr-1" />; }
        else if (['unpaid'].includes(s)) { colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/20"; icon = <Loader2 className="w-3 h-3 mr-1" />; }
        else if (['refunded'].includes(s)) { colorClass = "bg-rose-500/10 text-rose-400 border-rose-500/20"; icon = <RefreshCcw className="w-3 h-3 mr-1" />; }
        else { colorClass = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"; }
    } else {
        if (['delivered', 'completed'].includes(s)) { colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"; icon = <CheckCircle2 className="w-3 h-3 mr-1" />; }
        else if (['confirmed'].includes(s)) { colorClass = "bg-blue-500/10 text-blue-400 border-blue-500/20"; icon = <CheckCircle2 className="w-3 h-3 mr-1" />; }
        else if (['shipping'].includes(s)) { colorClass = "bg-purple-500/10 text-purple-400 border-purple-500/20"; icon = <Truck className="w-3 h-3 mr-1" />; }
        else if (['processing'].includes(s)) { colorClass = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"; icon = <PackageIcon className="w-3 h-3 mr-1" />; }
        else if (['cancelled', 'failed'].includes(s)) { colorClass = "bg-rose-500/10 text-rose-400 border-rose-500/20"; icon = <XCircle className="w-3 h-3 mr-1" />; }
        else { colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/20"; icon = <Loader2 className="w-3 h-3 mr-1" />; }
    }

    return (
        <Badge variant="outline" className={cn("pl-1 pr-2.5 py-0.5 border capitalize font-medium tracking-wide flex w-fit items-center", colorClass)}>
            {icon}
            {status}
        </Badge>
    );
};

export default function AdminOrdersPage() {
    // --- State ---
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters State
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentFilter, setPaymentFilter] = useState("all");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // --- Effects ---

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to page 1 on search change
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch Data
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const params: any = { page: currentPage };

                // Add filters if active
                if (debouncedSearch) params.search = debouncedSearch;
                if (statusFilter !== "all") params.status = statusFilter;
                if (paymentFilter !== "all") params.payment_status = paymentFilter;

                const { data } = await api.get("/admin/orders/", { params });

                if (data.results) {
                    setOrders(data.results);
                    setTotalCount(data.count);
                    setTotalPages(Math.ceil(data.count / 12));
                } else {
                    // Fallback
                    setOrders(data);
                    setTotalCount(data.length);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentPage, debouncedSearch, statusFilter, paymentFilter]);

    // --- Handlers ---

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPaymentFilter("all");
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-7xl">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">Orders</h1>
                            <p className="text-neutral-400 text-lg">Detailed view of all customer transactions.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Refresh button logic currently relies on re-fetching in useEffect when state changes, or explicit call if needed. Here we can force re-mount or simple state toggle if we want explicit refresh. */}
                            {/* For now keeping simplified interaction */}
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl mb-6 shadow-lg shadow-black/20">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                                <Input
                                    placeholder="Search by Order ID, Customer Name, Phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-black/20 border-white/10 focus:border-purple-500/50 text-white h-10 w-full"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 lg:gap-4 items-center">
                                <Select value={statusFilter} onValueChange={(val: string) => { setStatusFilter(val); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-[160px] bg-black/20 border-white/10 text-white h-10">
                                        <div className="flex items-center truncate">
                                            <Filter className="w-3.5 h-3.5 mr-2 text-neutral-400" />
                                            <SelectValue placeholder="Status" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        {STATUS_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value} className="focus:bg-white/10 focus:text-white cursor-pointer">{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={paymentFilter} onValueChange={(val: string) => { setPaymentFilter(val); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-[160px] bg-black/20 border-white/10 text-white h-10">
                                        <div className="flex items-center truncate">
                                            <div className="w-3.5 h-3.5 mr-2 bg-emerald-500/20 rounded-full border border-emerald-500/30 flex items-center justify-center text-[8px] text-emerald-400">$</div>
                                            <SelectValue placeholder="Payment" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        {PAYMENT_STATUS_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value} className="focus:bg-white/10 focus:text-white cursor-pointer">{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {(statusFilter !== 'all' || paymentFilter !== 'all' || searchTerm) && (
                                    <Button
                                        variant="ghost"
                                        onClick={handleClearFilters}
                                        className="text-neutral-400 hover:text-white px-3 h-10"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Orders Table Card */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden relative min-h-[500px] flex flex-col">

                        {/* Table Header */}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full min-w-[1000px] text-left border-collapse">
                                <thead className="sticky top-0 z-20 bg-black/40 backdrop-blur-md">
                                    <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-neutral-500">
                                        <th className="px-6 py-4 font-medium">Order Info</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Payment</th>
                                        <th className="px-6 py-4 font-medium">Items</th>
                                        <th className="px-6 py-4 font-medium text-right">Total</th>
                                        <th className="px-6 py-4 font-medium text-right">Action</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        [...Array(6)].map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={7} className="px-6 py-4">
                                                    <div className="h-12 w-full bg-white/5 rounded-lg animate-pulse" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3 text-neutral-500">
                                                    <ShoppingBag className="w-16 h-16 mb-2 opacity-20" />
                                                    <p className="text-lg font-medium text-white">No orders found</p>
                                                    <p className="text-sm">Try adjusting your filters.</p>
                                                    <Button variant="link" onClick={handleClearFilters} className="mt-2 text-purple-400">Clear all filters</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <AnimatePresence>
                                            {orders.map((order, i) => (
                                                <motion.tr
                                                    key={order.order_number}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2, delay: i * 0.05 }}
                                                    className="hover:bg-white/[0.02] transition-colors group"
                                                >
                                                    {/* Order Info */}
                                                    <td className="px-6 py-4 align-middle">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-white text-sm font-mono group-hover:text-purple-400 transition-colors">
                                                                #{order.order_number}
                                                            </span>
                                                            <button onClick={() => handleCopyId(order.order_number)} className="text-neutral-600 hover:text-white transition-colors">
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <div className="text-xs text-neutral-500 truncate max-w-[180px]">
                                                            {order.recipient_name || "Guest User"}
                                                        </div>
                                                    </td>

                                                    {/* Date */}
                                                    <td className="px-6 py-4 align-middle text-sm text-neutral-400">
                                                        {formatDate(order.created_at)}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-4 align-middle">
                                                        <StatusBadge status={order.status} />
                                                    </td>

                                                    {/* Payment */}
                                                    <td className="px-6 py-4 align-middle">
                                                        <StatusBadge status={order.payment_status} type="payment" />
                                                    </td>

                                                    {/* Items */}
                                                    <td className="px-6 py-4 align-middle text-sm text-neutral-300">
                                                        {order.item_count} items
                                                    </td>

                                                    {/* Total */}
                                                    <td className="px-6 py-4 align-middle text-right font-medium text-emerald-400">
                                                        {formatPrice(order.total)}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 align-middle text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0 text-neutral-400 hover:text-white">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/orders/${order.order_number}`} className="flex items-center cursor-pointer focus:bg-white/10 focus:text-white">
                                                                        <Eye className="w-4 h-4 mr-2" />
                                                                        View Details
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleCopyId(order.order_number)} className="cursor-pointer focus:bg-white/10 focus:text-white">
                                                                    <Copy className="w-4 h-4 mr-2" />
                                                                    Copy ID
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer / Pagination */}
                        <div className="bg-black/20 border-t border-white/10 px-6 py-4 flex items-center justify-between">
                            <div className="text-xs text-neutral-500">
                                Total <strong className="text-white">{totalCount}</strong> orders found
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-8 px-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <div className="text-xs font-medium text-neutral-400 px-2 min-w-[80px] text-center">
                                    Page <span className="text-white">{currentPage}</span> of {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || loading}
                                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-8 px-2"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
