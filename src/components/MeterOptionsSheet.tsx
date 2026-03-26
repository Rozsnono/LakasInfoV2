"use client";

import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X, Edit2, Trash2, Settings2, ChevronLeft } from "lucide-react";
import { useRouter } from "@/contexts/router.context";

interface MeterOptionsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    meterId: string;
    meterName: string;
}

const sheetVariants: Variants = {
    hidden: { y: "100%" },
    visible: {
        y: 0,
        transition: { type: "spring", damping: 25, stiffness: 200 },
    },
    exit: {
        y: "100%",
        transition: { duration: 0.3 },
    },
};

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

export default function MeterOptionsSheet({ isOpen, onClose, meterId, meterName }: MeterOptionsSheetProps) {
    const router = useRouter();

    const handleNavigate = (section?: string) => {
        onClose();
        setTimeout(() => {
            const url = `/dashboard/meters/${meterId}/edit${section ? `?focus=${section}` : ""}`;
            router.push(url);
        }, 150);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="fixed inset-0 bg-surface/80 backdrop-blur-md z-[150]"
                    />
                    <motion.div
                        variants={sheetVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl max-h-[90vh] flex flex-col"
                    >
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />

                        <div className="flex items-center justify-between mb-8 px-2 shrink-0">
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <ChevronLeft className="w-6 h-6 text-text-primary" />
                            </button>
                            <div className="flex flex-col items-center text-center">
                                <h3 className="text-xl font-black tracking-tight text-text-primary uppercase italic">Beállít<span className="text-primary">ások</span></h3>
                                <span className="text-[10px] font-black text-text-primary/40 uppercase tracking-widest mt-0.5">{meterName}</span>
                            </div>
                            <div className="w-10" />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 px-2 scrollbar-hide">
                            <OptionItem
                                icon={<Edit2 className="w-5 h-5 text-text-primary/60" />}
                                label="Adatok szerkesztése"
                                onClick={() => handleNavigate()}
                            />

                            <OptionItem
                                icon={<Settings2 className="w-5 h-5 text-text-primary/60" />}
                                label="Határérték figyelmeztetés"
                                onClick={() => handleNavigate("alert")}
                            />

                            <div className="h-px w-full bg-white/5 my-4" />

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="w-full bg-red-500/5 p-6 rounded-[2.5rem] border border-red-500/10 flex items-center gap-5 transition-all active:bg-red-500/10 group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/10 group-active:scale-90 transition-transform">
                                    <Trash2 className="w-5 h-5 text-red-500" />
                                </div>
                                <span className="text-red-500 font-black text-[17px] tracking-tight">Mérőóra törlése</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function OptionItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="w-full bg-white/5 p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-5 transition-all active:bg-white/10 group"
        >
            <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center shrink-0 border border-white/5 group-active:scale-90 transition-transform">
                {icon}
            </div>
            <span className="text-text-primary font-bold text-[17px] tracking-tight text-left">{label}</span>
        </motion.button>
    );
}