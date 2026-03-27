"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Users, BellOff, Search, LogOut, MessageCircle } from "lucide-react";
import { IMessageDetailDTO } from "@/models/message.modal";
import mongoose from "mongoose";

interface Member {
    _id: mongoose.Types.ObjectId | string;
    name: string;
    colorCode?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    chatDetails: IMessageDetailDTO; // Cseréld le a pontos DTO típusodra, ha van!
}

export default function MessageInfoSheet({ isOpen, onClose, chatDetails }: Props) {
    if (!chatDetails) return null;

    const members: Member[] = chatDetails.members || [];
    const isGroupChat = members.length > 2;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Sötétítő háttér */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150]"
                    />

                    {/* Felcsúszó panel */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl max-h-[90vh] flex flex-col gap-6 overflow-hidden"
                    >
                        {/* Behúzó zóna */}
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto shrink-0 cursor-grab" />

                        {/* Fejléc */}
                        <div className="flex items-center justify-between shrink-0">
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
                                <ChevronLeft className="w-6 h-6 text-text-primary" />
                            </button>
                            <h3 className="text-xl font-black tracking-tight uppercase italic text-text-primary">
                                Chat <span className="text-primary">Infó</span>
                            </h3>
                            <div className="w-10" />
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-8 pb-10">

                            {/* Fő információk (Név és Típus) */}
                            <div className="flex flex-col items-center gap-3 mt-4">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 shadow-2xl ${isGroupChat ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-white/5 border-white/10 text-white/60'}`}>
                                    {isGroupChat ? <Users className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-black text-text-primary tracking-tight">
                                        {isGroupChat ? "Közös Beszélgetés" : "Privát Beszélgetés"}
                                    </h2>
                                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1 block">
                                        {members.length} résztvevő
                                    </span>
                                </div>
                            </div>

                            {/* Gyorsműveletek (Gombok) */}
                            <div className="flex justify-center gap-4">
                                <button className="flex flex-col items-center gap-2 active:scale-95 transition-transform group">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                                        <Search className="w-5 h-5 text-text-primary" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Keresés</span>
                                </button>
                                <button className="flex flex-col items-center gap-2 active:scale-95 transition-transform group">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                                        <BellOff className="w-5 h-5 text-text-primary" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Némítás</span>
                                </button>
                            </div>

                            {/* Résztvevők listája */}
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="flex items-center justify-between px-4 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40">
                                        Tagok
                                    </span>
                                </div>
                                <div className="bg-surface-elevated rounded-[2rem] border border-white/5 overflow-hidden divide-y divide-white/5 shadow-xl">
                                    {members.map((member) => (
                                        <div key={member._id.toString()} className="flex items-center gap-4 p-4">
                                            <div
                                                className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-[12px] font-black shadow-inner text-white border border-white/10"
                                                style={{ backgroundColor: member.colorCode || '#333' }}
                                            >
                                                {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)}
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <span className="text-sm font-bold text-text-primary tracking-tight">
                                                    {member.name}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Veszélyzóna */}
                            <div className="mt-4">
                                <button className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center gap-3 active:scale-95 transition-transform">
                                    <LogOut className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest">Kilépés a beszélgetésből</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}