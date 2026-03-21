"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
    onCapture: (base64: string) => void;
    onClose: () => void;
}

export default function WebCameraScanner({ onCapture, onClose }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function startCamera() {
            // 1. ELLENŐRZÉS: Létezik-e egyáltalán az API?
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError("A kamera API nem elérhető. Ez valószínűleg a titkosítatlan (HTTP) kapcsolat miatt van. Használj HTTPS-t vagy localhost-ot!");
                return;
            }

            try {
                const s = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment",
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false,
                });
                setStream(s);
                if (videoRef.current) {
                    videoRef.current.srcObject = s;
                }
            } catch (err: Error | unknown) {
                console.error("Kamera hiba:", err);
                if (err instanceof Error && err.name === "NotAllowedError") {
                    setError("Megtagadtad a kamera hozzáférést. Kérlek, engedélyezd a böngészőben!");
                } else {
                    setError("Nem sikerült elindítani a kamerát. Próbáld meg frissíteni az oldalt!");
                }
            }
        }

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const base64 = canvas.toDataURL("image/jpeg", 0.8);
                onCapture(base64);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[300] flex flex-col"
        >
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent">
                <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white">
                    <X size={24} />
                </button>
                <span className="text-white font-black uppercase tracking-[0.3em] text-[10px] italic">Scanner Mode</span>
                <div className="w-12" />
            </div>

            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                {error ? (
                    <div className="px-10 text-center flex flex-col items-center gap-4">
                        <AlertCircle className="text-red-500 w-12 h-12" />
                        <p className="text-white text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                            {error}
                        </p>
                        <button onClick={onClose} className="mt-4 px-8 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase">Bezárás</button>
                    </div>
                ) : (
                    <>
                        <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[80%] aspect-video border-2 border-white/20 rounded-3xl relative">
                                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {!error && (
                <div className="p-12 bg-black flex flex-col items-center gap-6">
                    <canvas ref={canvasRef} className="hidden" />
                    <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={capturePhoto}
                        className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center p-1"
                    >
                        <div className="w-full h-full rounded-full bg-white shadow-lg" />
                    </motion.button>
                    <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Készíts fotót az óráról</p>
                </div>
            )}
        </motion.div>
    );
}