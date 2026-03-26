"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MapPin, Users } from "lucide-react";
import Link from "@/contexts/router.context";
import { useHouse } from "@/contexts/house.context";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function HouseholdDataSheet({ isOpen, onClose }: Props) {

    const { house } = useHouse();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-surface/80 backdrop-blur-md z-[150]" />
                    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                        <div className="flex items-center justify-between mb-8 px-2">
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><ChevronLeft className="w-6 h-6" /></button>
                            <h3 className="text-xl font-black tracking-tight uppercase italic">Háztartás <span className="text-primary">adatai</span></h3>

                            <div className="w-10" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Cím</label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary/20" />
                                    <input readOnly disabled type="text" defaultValue={house?.address} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-text-primary font-bold focus:outline-none focus:border-primary/50" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Lakók száma</label>
                                <div className="relative">
                                    <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary/20" />
                                    <input readOnly disabled type="number" defaultValue={house?.members.length} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-text-primary font-bold focus:outline-none focus:border-primary/50" />
                                </div>
                            </div>
                            <Link href="/dashboard/settings">
                                <button className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-xs mt-6 shadow-xl active:scale-95 transition-transform">Adatok frissítése</button>
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}