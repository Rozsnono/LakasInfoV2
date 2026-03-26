"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MessageCircle, Phone, Info, ExternalLink } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function HelpSupportSheet({ isOpen, onClose }: Props) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl"
                    >
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                        <div className="flex items-center justify-between mb-8 px-2">
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <h3 className="text-xl font-black tracking-tight uppercase italic">Támog<span className="text-primary">atás</span></h3>
                            <div className="w-10" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button className="flex flex-col items-center gap-4 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 active:scale-95 transition-transform group">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <MessageCircle className="w-7 h-7 text-primary" />
                                </div>
                                <span className="font-black uppercase tracking-widest text-[10px]">Chat indítása</span>
                            </button>
                            <button className="flex flex-col items-center gap-4 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 active:scale-95 transition-transform group">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                    <Phone className="w-7 h-7 text-emerald-500" />
                                </div>
                                <span className="font-black uppercase tracking-widest text-[10px]">Visszahívás</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-start gap-4">
                                <Info className="w-6 h-6 text-blue-400 shrink-0" />
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold text-sm">Gyakori kérdések</span>
                                    <p className="text-xs text-text-primary/40 leading-relaxed">Válaszok a rezsicsökkentéssel és a sávos árazással kapcsolatban.</p>
                                </div>
                            </div>

                            <button className="w-full flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 active:bg-white/10 transition-colors">
                                <span className="font-bold text-sm text-text-primary/80">Felhasználási feltételek</span>
                                <ExternalLink className="w-4 h-4 text-text-primary/20" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}