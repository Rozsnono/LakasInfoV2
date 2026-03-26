"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, AlertCircle, QrCode, ScanLine, X } from "lucide-react";
import Link from "@/contexts/router.context";
import { useRouter } from "@/contexts/router.context";
import React, { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from "react";
import { joinHouseAction } from "@/app/actions/house";
import QrScanner from "qr-scanner"; // A LEGERŐSEBB WEBASSEMBLY MOTOR

export default function JoinHousePage() {
    const router = useRouter();
    const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false); // ÚJ: Scanner állapota
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Engedélyezzük a betűket is a számok mellett
        if (/[^0-9a-zA-Z]/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.substring(value.length - 1).toUpperCase();
        setCode(newCode);

        // Automatikus ugrás a következőre
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join("");

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

    // Callback a QR kód olvasóhoz
    const onScanSuccess = (scannedText: string) => {
        if (scannedText && scannedText.length === 6) {
            const newCodeArr = scannedText.toUpperCase().split("");
            setCode(newCodeArr);
            setIsScanning(false); // Kamera bezárása
        } else {
            setError("A beolvasott QR kód érvénytelen. Győződj meg róla, hogy pontosan 6 karakter.");
            setIsScanning(false);
            if (navigator.vibrate) navigator.vibrate(300);
        }
    };

    return (
        <div className="flex flex-col min-h-screen p-6 relative overflow-hidden text-white">

            <header className="relative z-10 flex items-center mb-10 pt-6">
                <Link href="/onboarding" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-95 transition-transform border border-white/5 shadow-lg">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex-1 flex flex-col max-w-sm mx-auto w-full"
            >
                <div className="mb-10 space-y-2 text-left">
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Csatla<span className="text-primary">kozás</span>
                    </h1>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
                        Add meg a kódot
                    </p>
                </div>

                {/* Hibaüzenet megjelenítése */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 flex items-center gap-3 bg-primary/10 border border-primary/20 p-4 rounded-2xl text-primary text-[10px] font-black uppercase tracking-widest"
                        >
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleJoin} className="flex flex-col gap-6 flex-1">
                    {/* OTP Bemenetek - Ha hiba van, megrázkódik (shake) */}
                    <motion.div
                        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                        className="flex justify-between gap-2 mt-4"
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
                                className={`w-12 h-16 bg-white/5 border ${error ? 'border-primary/50' : 'border-white/10'} rounded-2xl text-center text-white text-3xl font-black focus:outline-none focus:border-primary transition-all shadow-xl disabled:opacity-50`}
                            />
                        ))}
                    </motion.div>

                    {/* Elválasztó és QR Gomb */}
                    <div className="flex flex-col gap-4 mt-4">
                        <div className="flex items-center gap-4">
                            <div className="h-px bg-white/10 flex-1" />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Vagy</span>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsScanning(true)}
                            className="w-full py-5 bg-white/5 rounded-[2rem] border border-white/10 text-white/80 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-white/10 hover:text-white"
                        >
                            <QrCode className="w-5 h-5 text-primary/80" />
                            Kód Beolvasása Kamerával
                        </button>
                    </div>

                    <div className="mt-auto pt-6 pb-8">
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            type="submit"
                            disabled={code.join("").length !== 6 || loading}
                            className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Belépés a háztartásba"
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>

            {/* QR SZKENNER OVERLAY */}
            <AnimatePresence>
                {isScanning && (
                    <QRScannerOverlay
                        onClose={() => setIsScanning(false)}
                        onSuccess={onScanSuccess}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// --- NATÍV KAMERA KOMPONENS (QR-SCANNER WEBASSEMBLY MOTORRAL) ---
interface ScannerProps {
    onClose: () => void;
    onSuccess: (code: string) => void;
}

function QRScannerOverlay({ onClose, onSuccess }: ScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        let qrScanner: QrScanner | null = null;

        const startScanner = async () => {
            if (!videoRef.current) return;

            try {
                // A qr-scanner csomag inicializálása
                qrScanner = new QrScanner(
                    videoRef.current,
                    (result: string) => {
                        // HA MEGTALÁLTA A KÓDOT!
                        if (isMounted && result) {
                            isMounted = false;
                            qrScanner?.stop();
                            onSuccess(result);
                        }
                    }
                );

                await qrScanner.start();
            } catch (err: unknown) {
                if (isMounted) {
                    setError((err as Error).message || "Kamera hozzáférés megtagadva vagy nem elérhető.");
                    console.error("Scanner Error:", err);
                }
            }
        };

        startScanner();

        return () => {
            isMounted = false;
            if (qrScanner) {
                qrScanner.stop();
                qrScanner.destroy();
            }
        };
    }, [onSuccess]);

    return (
        <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[300] flex flex-col bg-black"
        >
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-6 pt-12">
                <button
                    onClick={onClose}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl active:scale-90 transition-transform border border-white/10"
                >
                    <X size={24} />
                </button>
                <span className="text-[10px] font-black uppercase italic tracking-[0.3em] text-white">Kód beolvasása</span>
                <div className="w-12" />
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                {error ? (
                    <div className="flex flex-col items-center gap-4 px-10 text-center z-20">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                        <p className="text-xs font-bold uppercase leading-relaxed tracking-widest text-white/60">
                            {error}
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-4 rounded-2xl bg-white/10 border border-white/20 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white active:bg-white/20 transition-colors"
                        >
                            Vissza a kézi bevitelhez
                        </button>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            className="absolute inset-0 w-full h-full object-cover opacity-60"
                        />

                        {/* Scanner célkereszt és animáció */}
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-8">
                            <div className="relative aspect-square w-[70%] rounded-3xl border border-white/20 bg-white/5 backdrop-blur-[2px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                                {/* Pásztázó lézer animáció */}
                                <motion.div
                                    animate={{ y: ["0%", "400%", "0%"] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                    className="absolute top-0 w-full h-1/4 bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0"
                                />

                                {/* Sarkok (célkereszt) */}
                                <div className="absolute -left-1 -top-1 h-12 w-12 rounded-tl-3xl border-l-4 border-t-4 border-primary" />
                                <div className="absolute -right-1 -top-1 h-12 w-12 rounded-tr-3xl border-r-4 border-t-4 border-primary" />
                                <div className="absolute -bottom-1 -left-1 h-12 w-12 rounded-bl-3xl border-b-4 border-l-4 border-primary" />
                                <div className="absolute -bottom-1 -right-1 h-12 w-12 rounded-br-3xl border-b-4 border-r-4 border-primary" />
                            </div>
                            <div className="flex flex-col items-center gap-2 bg-black/40 px-6 py-3 rounded-full backdrop-blur-md">
                                <ScanLine className="w-6 h-6 text-primary animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Illeszd a kódot a keretbe</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}