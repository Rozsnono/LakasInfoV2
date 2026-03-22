"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, Loader2, AlertCircle, QrCode, ScanLine, X, Sparkles } from "lucide-react";
import Link from "@/contexts/router.context";
import { useRouter } from "@/contexts/router.context";
import React, { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { joinHouseAction } from "@/app/actions/house";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
};

export default function JoinHousePage() {
    const router = useRouter();
    const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/[^0-9a-zA-Z]/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.substring(value.length - 1).toUpperCase();
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleJoin = async (e?: React.FormEvent, scannedCode?: string) => {
        if (e) e.preventDefault();
        const fullCode = scannedCode || code.join("");

        if (fullCode.length !== 6) return;

        setLoading(true);
        setError(null);

        try {
            const result = await joinHouseAction(fullCode);

            if (result.success) {
                router.push("/dashboard");
                router.refresh();
            } else {
                setError(result.message || "Érvénytelen kód. Ellenőrizd és próbáld újra!");
                setLoading(false);
                if (navigator.vibrate) navigator.vibrate(200);
            }
        } catch (err) {
            setError("Hálózati hiba történt a csatlakozás során.");
            setLoading(false);
        }
    };

    // Callback a jövőbeli QR kód olvasóhoz
    const onScanSuccess = (scannedText: string) => {
        if (scannedText && scannedText.length === 6) {
            const newCodeArr = scannedText.toUpperCase().split("");
            setCode(newCodeArr);
            setIsScanning(false);
            handleJoin(undefined, scannedText);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-screen px-4 pt-12 pb-24 flex flex-col gap-8 overflow-x-hidden"
        >
            {/* Fejléc */}
            <motion.header variants={itemVariants} className="relative z-10 flex items-center gap-4">
                <Link
                    href="/dashboard/properties"
                    className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                </Link>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">
                    Csatla<span className="text-primary">kozás</span>
                </h1>
            </motion.header>

            <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-10 flex-1">
                <motion.div variants={itemVariants} className="space-y-4">
                    <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">
                        {isScanning ? "Kód beolvasása" : "Meghívó kód"}
                    </h2>

                    {/* Hibaüzenet */}
                    <AnimatePresence mode="wait">
                        {error && !isScanning && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 bg-red-500/10 border border-red-500/20 p-4 rounded-[2rem] flex items-center gap-3 overflow-hidden"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <span className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-tight">
                                    {error}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {!isScanning ? (
                            <motion.form
                                key="manual-input"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleJoin}
                                className="flex flex-col gap-6"
                            >
                                {/* Kód beviteli mezők */}
                                <motion.div
                                    animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                                    className="flex justify-between gap-2"
                                >
                                    {code.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => {
                                                inputRefs.current[index] = el;
                                            }}
                                            type="text"
                                            maxLength={1}
                                            disabled={loading}
                                            value={digit}
                                            onChange={(e) => handleChange(index, e)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className={`w-12 h-16 bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/5'} rounded-2xl text-center text-white text-2xl font-black focus:outline-none focus:border-primary/50 transition-all shadow-xl disabled:opacity-50`}
                                        />
                                    ))}
                                </motion.div>

                                {/* Helper Info Bento */}
                                <div className="mt-2 bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 flex items-start gap-4">
                                    <Sparkles className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                                    <p className="text-primary/50 text-[10px] font-bold leading-relaxed uppercase tracking-wider">
                                        Kérd el a <span className="text-primary">6 jegyű kódot</span> a lakótársadtól, vagy használjátok a QR kódos csatlakozást.
                                    </p>
                                </div>

                                {/* Elválasztó */}
                                <div className="flex items-center gap-4 my-2">
                                    <div className="h-px bg-white/5 flex-1" />
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Műveletek</span>
                                    <div className="h-px bg-white/5 flex-1" />
                                </div>

                                {/* QR Kód Gomb */}
                                <button
                                    type="button"
                                    onClick={() => setIsScanning(true)}
                                    className="w-full py-5 bg-surface rounded-[2.5rem] border border-white/5 text-white/60 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 hover:text-white"
                                >
                                    <QrCode className="w-5 h-5 text-primary/80" />
                                    Beolvasás QR Kóddal
                                </button>

                                {/* Mentés Gomb */}
                                <button
                                    type="submit"
                                    disabled={code.join("").length !== 6 || loading}
                                    className="w-full py-6 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Csatlakozás a házhoz"
                                    )}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="qr-scanner"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex flex-col gap-6"
                            >
                                {/* Kamerakép helye */}
                                <div className="relative w-full aspect-square bg-surface rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                                    <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center backdrop-blur-[2px]">
                                        <ScanLine className="w-16 h-16 text-primary/50 animate-pulse" strokeWidth={1.5} />
                                    </div>

                                    {/* IDE JÖN A KAMERA KOMPONENS! */}
                                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest z-20">
                                        Kamera engedélyezése...
                                    </p>

                                    {/* Szkennelő keret */}
                                    <div className="absolute inset-8 border-2 border-dashed border-white/20 rounded-[2rem] z-20 pointer-events-none" />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsScanning(false)}
                                    className="w-full py-6 mt-4 bg-white/5 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/10"
                                >
                                    <X className="w-5 h-5 text-white/50" />
                                    Mégsem, kézi bevitel
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Footer Branding */}
            <motion.p
                variants={itemVariants}
                className="mt-auto pt-12 text-center text-white/10 text-[10px] font-bold uppercase tracking-[0.5em]"
            >
                LakasInfo Ecosystem
            </motion.p>
        </motion.div>
    );
}