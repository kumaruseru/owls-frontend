"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { BadgeDollarSign, ShoppingCart, Users, Clock, ArrowRight, TrendingUp, Package, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DashboardStats {
    total_revenue: number;
    monthly_revenue: number;
    revenue_growth: number;
    total_orders: number;
    orders_growth: number;
    total_customers: number;
    customers_growth: number;
    pending_orders: number;
    recent_orders: any[];
}

// Inline StatusBadge for consistent styling
const StatusBadge = ({ status }: { status: string }) => {
    const getStyles = () => {
        const s = status?.toLowerCase();
        if (['completed', 'delivered', 'paid', 'confirmed'].includes(s)) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        if (['pending', 'processing'].includes(s)) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        if (['shipping'].includes(s)) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
        if (['cancelled', 'failed', 'refunded'].includes(s)) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    };

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider", getStyles())}>
            {status}
        </span>
    );
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/dashboard/');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatTrend = (value: number | undefined) => {
        if (value === undefined || value === null) return "0%";
        return `${value > 0 ? '+' : ''}${value}%`;
    };

    const isTrendUp = (value: number | undefined) => {
        return (value || 0) >= 0;
    };

    const statItems = [
        {
            title: "Total Revenue",
            value: stats ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.total_revenue) : "---",
            icon: BadgeDollarSign,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            desc: "Total earnings",
            trend: formatTrend(stats?.revenue_growth),
            trendUp: isTrendUp(stats?.revenue_growth)
        },
        {
            title: "Total Orders",
            value: stats?.total_orders ?? "---",
            icon: ShoppingCart,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            desc: "Orders placed",
            trend: formatTrend(stats?.orders_growth),
            trendUp: isTrendUp(stats?.orders_growth)
        },
        {
            title: "Total Customers",
            value: stats?.total_customers ?? "---",
            icon: Users,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            desc: "Registered users",
            trend: formatTrend(stats?.customers_growth),
            trendUp: isTrendUp(stats?.customers_growth)
        },
        {
            title: "Pending Orders",
            value: stats?.pending_orders ?? "---",
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            desc: "Action required",
            trend: stats?.pending_orders ? `${stats.pending_orders} waiting` : "All clear",
            trendUp: false
        },
    ];

    return (
        <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6 text-white font-sans">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">Dashboard</h1>
                    <p className="text-neutral-400 text-lg">Overview of your store&apos;s performance and activity.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
                    {statItems.map((stat, index) => (
                        <div
                            key={index}
                            className={cn(
                                "p-6 rounded-3xl bg-white/5 border backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] group",
                                "border-white/10"
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={cn("p-3.5 rounded-2xl", stat.bg)}>
                                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                                </div>
                                <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-white/5",
                                    stat.trendUp ? "text-emerald-400" : "text-zinc-400"
                                )}>
                                    {stat.trendUp && <TrendingUp className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-zinc-400">{stat.title}</h3>
                                <div className="text-2xl font-bold text-white font-display tracking-tight">
                                    {isLoading ? (
                                        <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse" />
                                    ) : (
                                        stat.value
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500">{stat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Orders Section */}
                <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl shadow-purple-900/5 overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Package className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                        </div>
                        <Link
                            href="/admin/orders"
                            className="group flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5"
                        >
                            View All Orders
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-black/20 text-neutral-400 text-[10px] uppercase font-bold tracking-widest border-b border-white/10">
                                    <th className="px-6 py-5">Order ID</th>
                                    <th className="px-6 py-5">Customer</th>
                                    <th className="px-6 py-5">Date Placed</th>
                                    <th className="px-6 py-5">Total Amount</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                                <span className="text-neutral-500 font-medium">Loading orders...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : !stats?.recent_orders?.length ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Package className="w-12 h-12 text-neutral-700 mb-2" />
                                                <h3 className="text-lg font-bold text-white">No orders yet</h3>
                                                <p className="text-neutral-500">New orders will appear here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    stats.recent_orders.map((order: any) => (
                                        <tr key={order.order_number} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/orders/${order.order_number}`} className="font-mono text-white hover:text-indigo-400 transition-colors">
                                                    #{order.order_number}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-300 font-medium">
                                                {order.recipient_name}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-400 text-sm">
                                                {format(new Date(order.created_at), "MMM d, yyyy • HH:mm")}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/orders/${order.order_number}`}
                                                    className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-wider transition-colors"
                                                >
                                                    Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Quick Insight Footer */}
                    {!isLoading && stats && (
                        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center gap-2 text-xs text-neutral-500 justify-center">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            <span>You have <span className="text-white font-bold">{stats.pending_orders}</span> pending orders requiring attention.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
