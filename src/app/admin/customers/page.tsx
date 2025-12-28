"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Search, Mail, Phone, Calendar, Trash2, ChevronLeft, ChevronRight, User as UserIcon, Loader2, ShieldCheck, UserCheck } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    date_joined: string;
    is_staff: boolean;
    avatar: string | null;
}

interface PaginatedResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: User[];
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on search change
            fetchCustomers(1, search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Fetch on page change (only if searchQuery didn't trigger it)
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetchCustomers(newPage, search);
        }
    };

    const fetchCustomers = async (currentPage: number, searchQuery: string) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("page", currentPage.toString());
            if (searchQuery) params.append("search", searchQuery);

            const response = await api.get(`/auth/admin/users/?${params.toString()}`);
            const data: PaginatedResponse = response.data;

            setCustomers(data.results);
            // Calculate total pages assuming default page size of 12 from backend
            setTotalPages(Math.ceil(data.count / 12));
        } catch (error) {
            console.error("Failed to fetch customers:", error);
            // toast.error("Failed to load customers."); // Squelch error toast for cleaner UI if empty
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;

        setIsDeleting(id);
        try {
            await api.delete(`/auth/admin/users/${id}/`);
            toast.success("Customer deleted successfully.");
            fetchCustomers(page, search); // Refresh
        } catch (error) {
            console.error("Failed to delete customer:", error);
            toast.error("Failed to delete customer.");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Fixed Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-7xl">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">Customers</h1>
                            <p className="text-neutral-400 text-lg">View and manage your registered users.</p>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl shadow-purple-900/5 overflow-hidden">

                        {/* Toolbar */}
                        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full sm:max-w-md group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                />
                            </div>

                            <div className="text-xs text-neutral-500 font-mono">
                                Total: <span className="text-white font-bold">{customers.length > 0 ? (page - 1) * 12 + customers.length : 0}</span> records displayed
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-black/20 text-neutral-400 text-[10px] uppercase font-bold tracking-widest border-b border-white/10">
                                        <th className="px-6 py-5">User Profile</th>
                                        <th className="px-6 py-5">Contact Info</th>
                                        <th className="px-6 py-5">Role & Status</th>
                                        <th className="px-6 py-5">Join Date</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                                    <span className="text-neutral-500 font-medium">Loading customers...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : customers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="p-4 bg-white/5 rounded-full mb-2">
                                                        <UserIcon className="w-8 h-8 text-neutral-500" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white">No customers found</h3>
                                                    <p className="text-neutral-500">Try adjusting your search terms.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        customers.map((customer) => (
                                            <tr key={customer.id} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center text-indigo-400 font-bold overflow-hidden relative">
                                                            {customer.avatar ? (
                                                                <img src={customer.avatar} alt={customer.full_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-lg">
                                                                    {(customer.full_name?.[0] || customer.email[0]).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-base group-hover:text-purple-400 transition-colors">
                                                                {customer.full_name || "Unknown Name"}
                                                            </div>
                                                            <div className="text-[10px] text-neutral-500 font-mono uppercase tracking-wide mt-0.5">ID: {customer.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-neutral-300">
                                                            <Mail className="w-3.5 h-3.5 text-neutral-500" />
                                                            {customer.email}
                                                        </div>
                                                        {customer.phone && (
                                                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                                <Phone className="w-3 h-3 text-neutral-600" />
                                                                {customer.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                                                        customer.is_staff
                                                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    )}>
                                                        {customer.is_staff ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                                        {customer.is_staff ? "Admin Staff" : "Customer"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                                                        <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                                                        {format(new Date(customer.date_joined), "MMM d, yyyy")}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(customer.id)}
                                                        disabled={isDeleting === customer.id || customer.is_staff}
                                                        className="w-9 h-9 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        title={customer.is_staff ? "Cannot delete admin users" : "Delete user"}
                                                    >
                                                        {isDeleting === customer.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between">
                            <div className="text-xs text-neutral-500">
                                Showing page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page <= 1 || isLoading}
                                    className="w-8 h-8 rounded-lg bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages || isLoading}
                                    className="w-8 h-8 rounded-lg bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
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
