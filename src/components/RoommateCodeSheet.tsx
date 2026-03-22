"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Copy, Check, Share2, House } from "lucide-react";
import { QRCode } from "react-qrcode-logo";
import { unknownShare } from "@/lib/unknown-share";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    inviteCode: string;
    copied: boolean;
    onCopy: () => void;
}

export default function InviteCodeSheet({ isOpen, onClose, inviteCode, copied, onCopy }: Props) {
    // Lucide ikon konvertálása QR-kód barát formátumba
    const iconAsDataUrl = useMemo(() => {
        const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles-icon lucide-sparkles"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>
    `;
        return `data:image/svg+xml;base64,${btoa(svgString)}`;
    }, []);

    const handleShare = async () => {
        await unknownShare({
            data: inviteCode,
            dataType: "string",
            fileName: "invite-code.txt",
            title: "Meghívó",
            setIsError: () => { }
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[150]"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl max-h-[100vh] overflow-y-auto no-scrollbar flex flex-col gap-10"
                    >
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-2 shrink-0" />

                        <div className="flex items-center justify-between px-2 shrink-0">
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <h3 className="text-xl font-black tracking-tight uppercase italic text-white">
                                Meghí<span className="text-primary">vás</span>
                            </h3>
                            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                <Share2 className="w-5 h-5 text-white/40" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-10 items-center justify-center flex-1">
                            <div className="relative group">
                                <div className="absolute -inset-16 bg-primary/20 blur-[100px] rounded-full opacity-60" />

                                <div className="relative p-6 rounded-[3.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-md">
                                    <QRCode
                                        value={inviteCode}
                                        size={220}
                                        quietZone={10}
                                        bgColor="transparent"
                                        fgColor="white"
                                        qrStyle="dots"
                                        eyeRadius={50}
                                        logoImage={iconAsDataUrl}
                                        logoWidth={50}
                                        logoHeight={50}
                                        logoPadding={5}
                                        logoPaddingStyle="circle"
                                        removeQrCodeBehindLogo
                                    />
                                </div>
                            </div>

                            <div className="w-full bg-white/5 rounded-[2.5rem] p-8 border border-white/5 flex flex-col items-center text-center gap-4 relative">
                                <span className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">Személyes kódod</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-5xl font-black text-primary tracking-[0.15em]">{inviteCode}</span>
                                    <button
                                        onClick={onCopy}
                                        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center active:scale-90 transition-all border border-white/10"
                                    >
                                        {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-white/40" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}