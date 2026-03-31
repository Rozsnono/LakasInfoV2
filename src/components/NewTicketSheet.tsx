"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Loader2, AlertCircle, AlignLeft, ShieldAlert, ArrowDown, Minus, ArrowUp, Send } from "lucide-react";
import { createTicketAction } from "@/app/actions/ticket";
// import { createTicketAction } from "@/app/actions/ticket";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type PriorityType = 'low' | 'medium' | 'high';

export default function NewTicketSheet({ isOpen, onClose, onSuccess }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<PriorityType>("medium");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim() || !description.trim()) return;

        setIsSaving(true);
        try {
            await createTicketAction({ title, description, priority });

            setTitle("");
            setDescription("");
            setPriority("medium");

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Save error:", error);
            alert("Hiba történt a hibajegy mentésekor.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]"
                    />

                    <motion.div
                        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl max-h-[90vh] flex flex-col gap-8"
                    >
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto shrink-0 cursor-grab" />

                        <div className="flex items-center justify-between shrink-0">
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
                                <ChevronLeft className="w-6 h-6 text-text-primary" />
                            </button>
                            <h3 className="text-xl font-black tracking-tight uppercase italic text-text-primary">
                                Új <span className="text-primary">Hibajegy</span>
                            </h3>
                            <div className="w-10" />
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4">

                            {/* Prioritás Választó */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Sürgősség (Prioritás)</label>
                                <div className="flex bg-black/40 p-1.5 rounded-3xl border border-white/5">
                                    <button
                                        onClick={() => setPriority("low")}
                                        className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all ${priority === "low" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg" : "text-text-primary/40 hover:bg-white/5 border border-transparent"}`}
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Ráér</span>
                                    </button>
                                    <button
                                        onClick={() => setPriority("medium")}
                                        className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all ${priority === "medium" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-lg" : "text-text-primary/40 hover:bg-white/5 border border-transparent"}`}
                                    >
                                        <Minus className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Normál</span>
                                    </button>
                                    <button
                                        onClick={() => setPriority("high")}
                                        className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all ${priority === "high" ? "bg-red-500/20 text-red-500 border border-red-500/30 shadow-lg" : "text-text-primary/40 hover:bg-white/5 border border-transparent"}`}
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Kritikus</span>
                                    </button>
                                </div>
                            </div>

                            {/* Hiba megnevezése */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Rövid megnevezés</label>
                                <div className="relative">
                                    <AlertCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary/20" />
                                    <input
                                        type="text"
                                        placeholder="Pl.: Csöpög a bojler"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-text-primary font-bold focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Hiba részletei */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Részletes leírás</label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-5 top-6 w-5 h-5 text-text-primary/20" />
                                    <textarea
                                        placeholder="Kérlek írd le pontosan mi a probléma..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={5}
                                        className="w-full bg-white/5 border border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-text-primary font-medium focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Beküldés Gomb */}
                        <div className="shrink-0 mt-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !title.trim() || !description.trim()}
                                className="w-full py-6 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Hibajegy Beküldése</>}
                            </button>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}