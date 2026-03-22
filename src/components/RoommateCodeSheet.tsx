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
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="180 160 230 230" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
            <g transform="translate(0.000000,600.000000) scale(0.100000,-0.100000)" fill="#ffffff" stroke="none">
                <path d="M2120 4148 c-85 -43 -81 13 -78 -880 3 -777 3 -787 24 -814 11 -15 33 -37 48 -48 27 -20 41 -21 489 -24 518 -3 523 -3 575 66 22 29 27 46 27 93 0 70 -21 104 -85 137 -44 22 -50 22 -417 22 l-373 0 0 678 c0 636 -1 679 -18 712 -19 36 -88 80 -127 80 -11 0 -41 -10 -65 -22z"/>
                <path d="M3860 4154 c-22 -9 -168 -147 -382 -362 l-348 -347 0 270 c0 295 -3 315 -61 358 -63 46 -171 27 -210 -37 -18 -29 -19 -60 -19 -551 0 -571 -2 -548 60 -580 68 -35 127 -13 190 72 24 32 252 268 507 524 l463 465 0 53 c0 65 -26 105 -84 132 -49 22 -70 23 -116 3z"/>
                <path d="M3425 3242 c-41 -25 -103 -96 -111 -126 -3 -13 0 -35 8 -49 20 -38 247 -267 275 -278 116 -44 237 69 191 179 -7 17 -71 90 -142 162 -141 142 -158 150 -221 112z"/>
            </g>
            </svg>
        `.trim();
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
                                        eyeRadius={3}
                                        logoImage={iconAsDataUrl}
                                        logoWidth={50}
                                        logoHeight={50}
                                        logoPadding={5}
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