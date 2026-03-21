"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Cpu, Sparkles, Smartphone, ShieldCheck, Code2, Bot } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function AppInfoSheet({ isOpen, onClose }: Props) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-[151] rounded-t-[3rem] border-t border-white/10 bg-surface px-6 pb-12 pt-4 shadow-2xl"
                    >
                        <div className="mx-auto mb-8 h-1.5 w-12 rounded-full bg-white/10" />

                        <div className="mb-8 flex items-center justify-between px-2">
                            <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white active:scale-95 transition-transform">
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <h3 className="text-xl font-black italic tracking-tight uppercase text-white">Alkalmaz<span className="text-primary">ás Info</span></h3>
                            <div className="w-10" />
                        </div>

                        <div className="mb-6 flex flex-col items-center justify-center rounded-[2.5rem] border border-white/5 bg-white/5 py-8">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/20 shadow-[0_0_30px_rgba(255,59,48,0.2)]">
                                <Sparkles className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="text-2xl font-black italic tracking-tight text-white uppercase">Lakas<span className="text-primary">Info</span></h2>
                            <span className="mt-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                                Verzió 1.0.3
                            </span>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center gap-4 rounded-[2.5rem] border border-white/5 bg-white/5 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
                                    <Cpu className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="text-center">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-white">Motor</span>
                                    <span className="text-xs font-bold text-white/40">Next.js 15+</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-4 rounded-[2.5rem] border border-white/5 bg-white/5 p-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10">
                                    <Bot className="h-6 w-6 text-purple-500" />
                                </div>
                                <div className="text-center">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-white">AI Modell</span>
                                    <span className="text-xs font-bold text-white/40">Gemini 2.5 Flash</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-3xl border border-white/5 bg-white/5 p-6">
                                <div className="flex items-center gap-4">
                                    <ShieldCheck className="h-6 w-6 text-emerald-400" />
                                    <span className="text-sm font-bold text-white/80">Környezet</span>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-white/40">Production</span>
                            </div>
                            <div className="flex items-center justify-between rounded-3xl border border-white/5 bg-white/5 p-6">
                                <div className="flex items-center gap-4">
                                    <Code2 className="h-6 w-6 text-white/40" />
                                    <span className="text-sm font-bold text-white/80">Fejlesztő</span>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-white/40">LakasInfo Ecosystem</span>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                            © {new Date().getFullYear()} Minden jog fenntartva
                        </p>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}