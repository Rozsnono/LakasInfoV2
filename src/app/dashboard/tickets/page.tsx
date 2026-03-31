"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, Search, Plus, Loader2, ShieldAlert, CheckCircle2, Clock, CircleDashed, ChevronRight, RefreshCwIcon } from "lucide-react";
import Link from "@/contexts/router.context";
import { useUser } from "@/contexts/user.context";
import { useAction } from "@/providers/action.provider";
import NewTicketSheet from "@/components/NewTicketSheet";
import { getTicketsForHouseAction } from "@/app/actions/ticket";
import { ITicket } from "@/models/ticket.model";
// import { getTicketsAction } from "@/app/actions/ticket";

// --- DTO: Ahogy a frontend várja az adatot ---
export interface ITicketDTO {
    _id: string;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'closed';
    priority: 'low' | 'medium' | 'high';
    dateLabel: string;
}

interface ITicketsResponse {
    success: boolean;
    value?: ITicket[];
    error?: string;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// --- Vizuális konfigurációk ---
const statusConfig = {
    open: { label: "Nyitott", icon: <CircleDashed className="w-4 h-4" />, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
    in_progress: { label: "Folyamatban", icon: <Clock className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    closed: { label: "Lezárva", icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" }
};

const priorityColors = {
    low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    high: "text-red-500 bg-red-500/10 border-red-500/20"
};

const priorityLabels = { low: "Ráér", medium: "Normál", high: "Kritikus" };

export default function TicketsClient() {
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'in_progress' | 'closed'>('all');
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

    const { data, isPending, error, execute } = useAction<ITicketsResponse, [string]>(
        getTicketsForHouseAction,
        {
            immediate: true,
            initialArgs: [user!.houseId!],
            condition: !!user?.houseId,
            repeatDelay: 10000,
        }
    );

    const filteredTickets = useMemo(() => {
        if (!data || !data.value) return [];
        return data.value.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === 'all' || t.status === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [searchQuery, activeFilter, data]);

    const openCount = data?.value?.filter(t => t.status === 'open').length || 0;



    return (
        <motion.div
            initial="hidden" animate="visible" variants={containerVariants}
            className="relative min-h-full px-4 pt-12 pb-24 flex flex-col gap-6"
        >
            <motion.header variants={itemVariants} className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-surface flex items-center justify-center active:scale-95 transition-transform border border-white/5 shadow-xl text-text-primary">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-text-primary tracking-tight italic uppercase">Hiba<span className="text-primary">jegyek</span></h1>
                            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest opacity-60 mt-1">
                                {isPending && !data ? "Betöltés..." : `${openCount} nyitott feladat`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddSheetOpen(true)}
                        className="w-12 h-12 bg-primary text-text-primary rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                    >
                        <Plus className="w-6 h-6" strokeWidth={3} />
                    </button>

                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Keresés a hibák között..."
                        className="w-full bg-surface/50 backdrop-blur-md border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-text-primary focus:outline-none focus:border-primary/30 transition-all placeholder:text-text-secondary/40"
                    />
                </div>



                {/* Státusz Szűrő (Pille gombok) */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                    <button
                        onClick={() => setActiveFilter('all')}
                        className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors ${activeFilter === 'all' ? 'bg-white text-black shadow-xl' : 'bg-surface border border-white/5 text-text-secondary'}`}
                    >
                        Összes
                    </button>
                    {(['open', 'in_progress', 'closed'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setActiveFilter(status)}
                            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap flex items-center gap-2 transition-colors ${activeFilter === status ? statusConfig[status].bg + " " + statusConfig[status].color + " shadow-xl" : 'bg-surface border border-white/5 text-text-secondary'}`}
                        >
                            {statusConfig[status].icon}
                            {statusConfig[status].label}
                        </button>
                    ))}
                </div>
            </motion.header>

            <div className="absolute right-4 bottom-20 z-20">
                <button
                    onClick={() => execute(user!.houseId!)}
                    className="border border-text-primary w-12 h-12 bg-background/10 text-text-primary rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                >
                    <RefreshCwIcon className={`w-6 h-6 ${isPending && !data ? 'animate-spin' : ''}`} strokeWidth={3} />
                </button>
            </div>

            <motion.main variants={itemVariants} className="pb-32 flex flex-col flex-1 z-10">
                <div className="flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                        {isPending && !data ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 gap-4 bg-surface rounded-[2.5rem] border border-white/5 shadow-xl">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-text-primary/40 text-xs font-bold uppercase tracking-widest">Hibajegyek betöltése...</p>
                            </motion.div>
                        ) : error ? (
                            <motion.div key="error" variants={itemVariants} className="text-center py-20 px-6 bg-surface rounded-[2.5rem] border border-white/5 shadow-xl">
                                <p className="text-red-400 text-sm font-bold">Hiba az adatok lekérésekor.</p>
                                <button onClick={() => execute(user!.houseId!)} className="mt-4 text-primary text-xs font-bold uppercase tracking-widest underline">Újrapróbálkozás</button>
                            </motion.div>
                        ) : filteredTickets.length === 0 ? (
                            <motion.div key="empty" variants={itemVariants} className="text-center py-20 flex flex-col items-center gap-3 bg-surface rounded-[2.5rem] border border-white/5 shadow-xl">
                                <ShieldAlert className="w-10 h-10 text-white/10" />
                                <p className="text-text-primary/30 text-sm font-bold uppercase tracking-widest italic text-center px-6">Nincsenek hibajegyek.<br />Minden tökéletesen működik!</p>
                            </motion.div>
                        ) : (
                            filteredTickets.map((ticket, index) => {
                                const status = statusConfig[ticket.status];
                                const priorityClass = priorityColors[ticket.priority];

                                return (
                                    <Link key={ticket._id.toString()} href={`/dashboard/tickets/${ticket._id}`}>
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
                                            className="bg-surface rounded-[2rem] border border-white/5 shadow-xl p-5 flex flex-col gap-4 active:scale-[0.98] transition-transform"
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <h3 className="text-text-primary font-black text-[17px] tracking-tight line-clamp-1">{ticket.title}</h3>
                                                    <p className="text-text-secondary text-xs font-medium line-clamp-2 opacity-80">{ticket.description}</p>
                                                </div>
                                                <div className={`shrink-0 flex items-center justify-center p-2 rounded-full border ${status.bg} ${status.color}`}>
                                                    {status.icon}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-1 pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-2">
                                                    {/* Prioritás Badge */}
                                                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${priorityClass}`}>
                                                        {priorityLabels[ticket.priority]}
                                                    </span>
                                                    {/* Időbélyeg */}
                                                    <span className="text-text-secondary text-[10px] font-bold uppercase tracking-widest ml-2 opacity-50">
                                                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("hu-HU", { day: "2-digit", month: "short", year: "2-digit" }) : ""}
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-text-secondary opacity-30" />
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </motion.main>

            <NewTicketSheet
                isOpen={isAddSheetOpen}
                onClose={() => setIsAddSheetOpen(false)}
                onSuccess={() => execute(user!.houseId!)}
            />
        </motion.div>
    );
}