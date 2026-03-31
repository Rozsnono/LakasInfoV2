"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    ArrowLeft, Search, Plus, Loader2, ChevronRight,
    MessageCircle, Users, MailOpen
} from "lucide-react";
import Link from "@/contexts/router.context";
import { useAction } from "@/providers/action.provider";
import { useUser } from "@/contexts/user.context";
import NewMessageSheet from "@/components/NewMessageSheet";
import { getMessagesAction } from "@/app/actions/message";

// --- DTO (Data Transfer Object) ---
// Ez az a formátum, amit a listában meg tudunk jeleníteni a Te modelled alapján.
export interface IChatThreadDTO {
    _id: string;            // A beszélgetés azonosítója (IMessageBase._id)
    chatName: string;       // A tagok alapján generált név (pl. "Közös Chat" vagy "Kovács Péter")
    isGroup: boolean;       // Kettőnél több tag esetén true
    lastMessage: string;    // A 'messages' tömb utolsó elemének 'content' mezője
    lastMessageTime: string;// A 'messages' tömb utolsó elemének 'timestamp' mezője
    isUnread: boolean;      // Backend számolja ki (látta-e már a user az utolsó üzenetet)
}

interface IChatsResponse {
    success: boolean;
    data: IChatThreadDTO[];
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function MessagesClient() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const { user } = useUser();

    // A korábban megírt Polling-os useAction
    const { data, isPending, error, execute } = useAction(
        getMessagesAction,
        {
            immediate: true,
            initialArgs: [''],
            condition: !!user?._id,
        }
    );

    const filteredChats = useMemo(() => {
        if (!data?.value) return [];
        return data.value;
    }, [data, searchQuery]);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-full px-4 pt-12 pb-24 flex flex-col gap-6"
        >
            <motion.header variants={itemVariants} className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center active:scale-95 transition-transform border border-white/5 shadow-xl text-text-primary"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-text-primary tracking-tight italic uppercase">Üzene<span className="text-primary">tek</span></h1>
                            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest opacity-60 mt-1">
                                {isPending && !data ? "Betöltés..." : `${0} olvasatlan`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddSheetOpen(true)}
                        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
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
                        placeholder="Keresés a beszélgetésekben..."
                        className="w-full bg-surface/50 backdrop-blur-md border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-text-primary focus:outline-none focus:border-primary/30 transition-all placeholder:text-text-secondary/40"
                    />
                </div>
            </motion.header>

            <motion.main variants={itemVariants} className="pb-32 flex flex-col flex-1 z-10">
                <div className="bg-surface rounded-[2.5rem] border border-white/5 shadow-xl overflow-hidden flex flex-col">
                    <AnimatePresence mode="popLayout">
                        {isPending || !data || !data!.value ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-text-primary/40 text-xs font-bold uppercase tracking-widest">Szálak szinkronizálása...</p>
                            </motion.div>
                        ) : error ? (
                            <motion.div key="error" variants={itemVariants} className="text-center py-20 px-6">
                                <p className="text-red-400 text-sm font-bold">Hiba történt az adatok betöltésekor.</p>
                                <button onClick={() => execute(user!.houseId!)} className="mt-4 text-primary text-xs font-bold uppercase tracking-widest underline">Újrapróbálkozás</button>
                            </motion.div>
                        ) : data!.value!.length === 0 ? (
                            <motion.div key="empty" className="text-center py-20 flex flex-col items-center gap-3">
                                <MailOpen className="w-10 h-10 text-white/10" />
                                <p className="text-text-primary/30 text-sm font-bold uppercase tracking-widest italic">Még nem kezdtél beszélgetést.</p>
                            </motion.div>
                        ) : (
                            data!.value!.map((chat, index) => {
                                const isUnread = false

                                return (
                                    /* Itt linkelünk a konkrét Chat Room (beszélgetés) oldalra az _id alapján! */
                                    <Link key={chat._id.toString()} href={`/dashboard/messages/${chat._id.toString()}`} className="w-full">
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.02 }}
                                            className={`flex items-center justify-between p-5 active:bg-white/5 transition-colors cursor-pointer ${index !== filteredChats.length - 1 ? 'border-b border-white/5' : ''}`}
                                        >
                                            <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                                <div className="relative shrink-0">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${chat.members.length > 2 ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/10 text-white/60'}`}>
                                                        {chat.members.length > 2 ? <Users className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                                                    </div>
                                                    {isUnread && <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary border-2 border-background rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />}
                                                </div>

                                                <div className="flex flex-col text-left flex-1 min-w-0 pr-4">
                                                    <span className={`text-[16px] tracking-tight truncate ${isUnread ? 'font-black text-white' : 'font-bold text-text-primary/80'}`}>
                                                        {chat.members.length > 2 ? 'Közös Chat' : chat.members.find(m => m._id.toString() !== user!._id)?.name || "Ismeretlen Felhasználó"}
                                                    </span>
                                                    <span className={`text-[13px] truncate mt-0.5 ${isUnread ? 'font-bold text-white opacity-90' : 'font-medium text-text-secondary opacity-50'}`}>
                                                        {chat.lastChat}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-[0.6rem] uppercase tracking-widest ${isUnread ? 'font-black text-primary' : 'font-bold text-text-secondary opacity-50'}`}>
                                                        {chat.lastChatTime ? new Date(chat.lastChatTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                </div>
                                                <ChevronRight className="w-5 h-5 opacity-20" />
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </motion.main>

            <NewMessageSheet
                isOpen={isAddSheetOpen}
                onClose={() => setIsAddSheetOpen(false)}
                onSuccess={() => execute(user!.houseId!)}
            />
        </motion.div>
    );
}