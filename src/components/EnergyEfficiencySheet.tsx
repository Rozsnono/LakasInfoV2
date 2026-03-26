"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, TrendingDown, Lightbulb } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnergyEfficiencySheet({ isOpen, onClose }: Props) {
  const tips = [
    "Éjszakai áram használata 22:00 után",
    "Vízlágyító használata a bojlerhez",
    "Hűtő hőmérsékletének optimalizálása"
  ];
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]" />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl">
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
            <div className="flex items-center justify-between mb-8 px-2">
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><ChevronLeft className="w-6 h-6" /></button>
              <h3 className="text-xl font-black tracking-tight uppercase italic">Takarék<span className="text-primary">osság</span></h3>

              <div className="w-10" />
            </div>
            <div className="flex flex-col gap-6">
              <div className="p-6 bg-primary/10 rounded-[2.5rem] border border-primary/20 relative overflow-hidden">
                <TrendingDown className="w-12 h-12 text-primary opacity-20 absolute -right-2 -top-2" />
                <h4 className="text-primary font-black uppercase tracking-widest text-[10px] mb-2">Gemini AI javaslat</h4>
                <p className="text-text-primary font-bold text-lg leading-tight">Cseréld le a konyhai izzókat LED-re! Évi 12 400 Ft-ot spórolhatsz.</p>
              </div>
              <div className="space-y-3">
                {tips.map((tip, idx) => (
                  <div key={idx} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-black text-xs">{idx + 1}</div>
                    <span className="text-sm font-semibold">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}