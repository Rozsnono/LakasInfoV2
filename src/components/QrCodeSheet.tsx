"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Copy, Check, Share2 } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    code: string;
}

export default function QrCodeSheet({ isOpen, onClose, code }: Props) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-surface/95 backdrop-blur-xl z-[200]" />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed inset-0 m-auto w-[90%] max-w-sm h-fit bg-surface-elevated rounded-[3rem] p-10 flex flex-col items-center border border-white/10 shadow-2xl z-[201]">
                        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform"><X className="w-5 h-5" /></button>
                        <div className="w-full aspect-square bg-white rounded-[2.5rem] p-8 mb-8 flex items-center justify-center shadow-inner"><QrCode className="w-full h-full text-black" strokeWidth={1.5} /></div>
                        <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">{code}</h3>
                        <div className="flex gap-3 w-full mt-6">
                            <button onClick={handleCopy} className="flex-1 py-4 bg-white/5 rounded-2xl flex items-center justify-center gap-2 border border-white/5 active:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest">{copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} Másolás</button>
                            <button onClick={() => navigator.share?.({ title: 'LakasInfo', text: code })} className="flex-1 py-4 bg-primary rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"><Share2 className="w-4 h-4" /> Küldés</button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}