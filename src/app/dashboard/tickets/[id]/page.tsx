"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    ArrowLeft, Loader2, ShieldAlert, CheckCircle2,
    Clock, CircleDashed, AlignLeft, User, CalendarDays, Wrench
} from "lucide-react";
import Link from "@/contexts/router.context";
import { useParams } from "next/navigation";
import { useUser } from "@/contexts/user.context";
import { useAction } from "@/providers/action.provider";
import { getTicketByIdAction, updateTicketStatusAction } from "@/app/actions/ticket";

// --- MOCK ACTIONS (Ezeket majd cseréld a valódira!) ---
// import { getTicketByIdAction, updateTicketStatusAction } from "@/app/actions/ticket";

// --- DTO: Egyetlen hibajegy részletes adatai ---
export interface ITicketDetailDTO {
    _id: string;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'closed';
    priority: 'low' | 'medium' | 'high';
    creatorName: string;
    assignedToName?: string;
    createdAtLabel: string;
    updatedAtLabel: string;
}

interface ITicketResponse {
    success: boolean;
    data?: ITicketDetailDTO;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// --- Vizuális konfigurációk ---
const statusConfig = {
    open: { label: "Nyitott", icon: <CircleDashed className="w-5 h-5" />, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
    in_progress: { label: "Folyamatban", icon: <Clock className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    closed: { label: "Lezárva", icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" }
};

const priorityConfig = {
    low: { label: "Ráér", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    medium: { label: "Normál", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    high: { label: "Kritikus", color: "text-red-500 bg-red-500/10 border-red-500/20" }
};

export default function TicketDetailClient() {
    const { id: ticketId } = useParams() as { id: string };
    const { user } = useUser();

    const [isUpdating, setIsUpdating] = useState(false);

    const { data, isPending, error, execute: refreshTicket } = useAction(
        getTicketByIdAction, // Cseréld: getTicketByIdAction
        {
            immediate: true,
            initialArgs: [ticketId],
            condition: !!ticketId
        }
    );

    const ticket = data?.value;

    // --- STÁTUSZ MÓDOSÍTÁSA ---
    const handleStatusChange = async (newStatus: 'open' | 'in_progress' | 'closed') => {
        if (!ticket || ticket.status === newStatus || isUpdating) return;

        setIsUpdating(true);
        try {
            await updateTicketStatusAction(ticketId, newStatus);

            // Sikeres frissítés után újra lekérjük az adatokat
            await refreshTicket(ticketId);
        } catch (error) {
            console.error("Hiba a státusz frissítésekor:", error);
            alert("Nem sikerült frissíteni a státuszt.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-[100dvh] px-4 pt-12 pb-24 flex flex-col gap-6 overflow-x-hidden"
        >
            {/* --- FEJLÉC --- */}
            <motion.header variants={itemVariants} className="relative z-10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/tickets" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform">
                        <ArrowLeft className="w-5 h-5 text-text-primary" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase italic leading-none">
                            Hiba<span className="text-primary">jegy</span>
                        </h1>
                        <span className="text-text-secondary opacity-60 text-[10px] font-bold uppercase tracking-widest mt-1">
                            Részletek
                        </span>
                    </div>
                </div>
            </motion.header>

            <motion.main variants={itemVariants} className="flex flex-col gap-6 flex-1 z-10">
                <AnimatePresence mode="wait">
                    {isPending && !data ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1 gap-4 bg-surface rounded-[2.5rem] border border-white/5 shadow-xl min-h-[300px]">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-text-primary/40 text-[10px] font-bold uppercase tracking-widest">Adatok betöltése...</p>
                        </motion.div>
                    ) : error || !ticket ? (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1 gap-2 text-center px-4 bg-surface rounded-[2.5rem] border border-white/5 shadow-xl min-h-[300px]">
                            <ShieldAlert className="w-10 h-10 text-red-500/50 mb-2" />
                            <p className="text-red-400 text-sm font-bold">A hibajegy nem található.</p>
                            <button onClick={() => refreshTicket(ticketId)} className="text-primary text-[10px] font-black uppercase tracking-widest underline mt-2">Újra</button>
                        </motion.div>
                    ) : (
                        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">

                            {/* 1. KÁRTYA: Fő adatok és Státusz */}
                            <div className="bg-surface rounded-[2.5rem] border border-white/5 shadow-2xl p-6 flex flex-col gap-6 relative overflow-hidden">
                                {/* Díszítő háttérfény a státusznak megfelelően */}
                                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-20 ${ticket.status === 'open' ? 'bg-red-500' : ticket.status === 'in_progress' ? 'bg-blue-500' : 'bg-emerald-500'}`} />

                                <div className="flex items-start justify-between gap-4 relative z-10">
                                    <div className="flex flex-col gap-2">
                                        <span className={`self-start px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${priorityConfig[ticket.priority].color}`}>
                                            {priorityConfig[ticket.priority].label} Prioritás
                                        </span>
                                        <h2 className="text-2xl font-black text-text-primary tracking-tight leading-tight">
                                            {ticket.title}
                                        </h2>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 border-t border-white/5 pt-5 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                            <User className="w-5 h-5 text-text-primary/40" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-50">Bejelentő</span>
                                            <span className="text-sm font-bold text-text-primary">{(ticket.createdBy as unknown as { name: string })?.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                            <CalendarDays className="w-5 h-5 text-text-primary/40" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-50">Létrehozva</span>
                                            <span className="text-sm font-bold text-text-primary">{new Date(ticket.createdAt!).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. KÁRTYA: Részletes leírás */}
                            <div className="bg-surface rounded-[2.5rem] border border-white/5 shadow-xl p-6 flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <AlignLeft className="w-5 h-5 text-text-primary/40" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-60">Hiba Leírása</h3>
                                </div>
                                <p className="text-[15px] font-medium leading-relaxed text-text-primary/90 whitespace-pre-wrap">
                                    {ticket.description}
                                </p>
                            </div>

                            {/* 3. KÁRTYA: Státusz Menedzser (Műveletek) */}
                            {
                                user?.houseRole === 'owner' && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 ml-4">Státusz Kezelése</label>
                                        <div className="bg-surface rounded-[2.5rem] p-3 border border-white/5 shadow-2xl flex flex-col gap-2 relative overflow-hidden">
                                            {isUpdating && (
                                                <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-[2.5rem]">
                                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                                </div>
                                            )}

                                            {(['open', 'in_progress', 'closed'] as const).map((status) => {
                                                const config = statusConfig[status];
                                                const isCurrent = ticket.status === status;

                                                return (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(status)}
                                                        disabled={isCurrent || isUpdating}
                                                        className={`w-full p-5 rounded-[1.5rem] flex items-center justify-between transition-all active:scale-[0.98] ${isCurrent ? config.bg + " border" : "bg-transparent border border-transparent hover:bg-white/5"}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrent ? 'bg-white/10' : 'bg-white/5'}`}>
                                                                <span className={isCurrent ? config.color : 'text-text-secondary'}>
                                                                    {config.icon}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col text-left">
                                                                <span className={`font-black text-[15px] tracking-tight ${isCurrent ? config.color : 'text-text-primary/60'}`}>
                                                                    {config.label}
                                                                </span>
                                                                {isCurrent && <span className="text-[9px] font-bold uppercase tracking-widest text-text-primary/40 mt-0.5">Jelenlegi Állapot</span>}
                                                            </div>
                                                        </div>
                                                        {isCurrent && <div className={`w-3 h-3 rounded-full ${config.bg.split(' ')[0]} animate-pulse`} />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            }

                            {
                                user?.houseRole !== 'owner' && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 ml-4">Státusz</label>
                                        <div className="bg-surface rounded-[2.5rem] p-3 border border-white/5 shadow-2xl flex flex-col gap-2 relative overflow-hidden">
                                            {isUpdating && (
                                                <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-[2.5rem]">
                                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                                </div>
                                            )}

                                            {([ticket.status]).map((status) => {
                                                const config = statusConfig[status];
                                                const isCurrent = ticket.status === status;

                                                return (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(status)}
                                                        disabled={isCurrent || isUpdating}
                                                        className={`w-full p-5 rounded-[1.5rem] flex items-center justify-between transition-all active:scale-[0.98] ${isCurrent ? config.bg + " border" : "bg-transparent border border-transparent hover:bg-white/5"}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrent ? 'bg-white/10' : 'bg-white/5'}`}>
                                                                <span className={isCurrent ? config.color : 'text-text-secondary'}>
                                                                    {config.icon}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col text-left">
                                                                <span className={`font-black text-[15px] tracking-tight ${isCurrent ? config.color : 'text-text-primary/60'}`}>
                                                                    {config.label}
                                                                </span>
                                                                {isCurrent && <span className="text-[9px] font-bold uppercase tracking-widest text-text-primary/40 mt-0.5">Jelenlegi Állapot</span>}
                                                            </div>
                                                        </div>
                                                        {isCurrent && <div className={`w-3 h-3 rounded-full ${config.bg.split(' ')[0]} animate-pulse`} />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            }

                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.main>
        </motion.div>
    );
}