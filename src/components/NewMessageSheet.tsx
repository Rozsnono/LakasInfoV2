"use client";

import React, { JSX, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft, Loader2, Users, AlignLeft, Send,
    ChevronDown, Check, User
} from "lucide-react";
import { useAction } from "@/providers/action.provider";
import { createMessageAction, getMessageableUsersAction } from "@/app/actions/message";
import { useUser } from "@/contexts/user.context";
// import { createConversationAction } from "@/app/actions/message";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function NewMessageSheet({ isOpen, onClose, onSuccess }: Props) {
    const [recipient, setRecipient] = useState<string>("all");
    const [content, setContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [MOCK_USERS, setMockUsers] = useState<{ id: string; label: string; icon: JSX.Element }[]>([
        { id: "all", label: "Mindenki", icon: <Users className="w-4 h-4" /> }
    ]);
    const { user } = useUser();

    const { data, isPending, error, execute } = useAction(
        getMessageableUsersAction,
        {
            immediate: true,
            initialArgs: [],
            condition: !!user?._id,
            onSuccess: (data) => {
                setMockUsers([
                    { id: "all", label: "Mindenki", icon: <Users className="w-4 h-4" /> },
                    ...data.value.map((u: any) => ({
                        id: u._id,
                        label: u.name,
                        icon: <User className="w-4 h-4" />
                    }))
                ]);
            }
        }
    );

    // ÚJ: Állapot az egyedi Select nyitásához/csukásához
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    const handleSave = async () => {
        if (!content.trim()) return;

        setIsSaving(true);
        try {
            await createMessageAction(recipient === "all" ? MOCK_USERS.filter(u => u.id !== "all").map(u => u.id) : [recipient], content);

            setContent("");
            setRecipient("all");
            setIsSelectOpen(false);

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Save error:", error);
            alert("Hiba történt az üzenet elküldésekor.");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedRecipient = MOCK_USERS.find(r => r.id === recipient) || MOCK_USERS[0];

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
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl max-h-[90vh] flex flex-col gap-8"
                    >
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto shrink-0 cursor-grab" />

                        <div className="flex items-center justify-between shrink-0">
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <h3 className="text-xl font-black tracking-tight uppercase italic">Új <span className="text-primary">Beszélgetés</span></h3>
                            <div className="w-10" />
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4">

                            {/* EGYEDI CÍMZETT VÁLASZTÓ (CUSTOM SELECT) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Címzett</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                                        className="w-full bg-white/5 border border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-white font-bold focus:outline-none transition-colors flex items-center justify-between active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                            <span>{selectedRecipient.label}</span>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-white/20 transition-transform duration-300 ${isSelectOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {/* Legördülő menü (Dropdown) */}
                                    <AnimatePresence>
                                        {isSelectOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden z-[160] backdrop-blur-xl"
                                            >
                                                <div className="max-h-[200px] overflow-y-auto no-scrollbar flex flex-col">
                                                    {MOCK_USERS.map((opt) => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => {
                                                                setRecipient(opt.id);
                                                                setIsSelectOpen(false);
                                                            }}
                                                            className={`w-full flex items-center justify-between p-4 text-left transition-colors active:bg-white/5 hover:bg-white/5 ${recipient === opt.id ? "bg-white/5" : ""}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${recipient === opt.id ? "bg-primary/20 text-primary" : "bg-white/5 text-white/60"}`}>
                                                                    {opt.icon}
                                                                </div>
                                                                <span className={`text-sm tracking-tight ${recipient === opt.id ? "font-black text-white" : "font-bold text-white/60"}`}>
                                                                    {opt.label}
                                                                </span>
                                                            </div>
                                                            {recipient === opt.id && <Check className="w-4 h-4 text-primary" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Üzenet szövege */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Üzenet</label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-5 top-6 w-5 h-5 text-white/20" />
                                    <textarea
                                        placeholder="Írd ide az üzeneted..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/5 rounded-[2rem] py-5 pl-14 pr-6 text-white font-medium focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Küldés Gomb */}
                        <div className="shrink-0 mt-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !content.trim()}
                                className="w-full py-6 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Üzenet küldése</>}
                            </button>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}