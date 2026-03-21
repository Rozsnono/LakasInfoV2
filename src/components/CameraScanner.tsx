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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let currentStream: MediaStream | null = null;

        async function startCamera() {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError("A kamera API nem elérhető. Engedélyezd a hozzáférést!");
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment",
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false,
                });

                currentStream = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err: unknown) {
                if (err instanceof Error && err.name === "NotAllowedError") {
                    setError("Megtagadtad a kamera hozzáférést. Kérlek, engedélyezd a beállításokban!");
                } else {
                    setError("Nem sikerült elindítani a kamerát. Próbáld meg újra!");
                }
            }
        }

        startCamera();

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach((track) => track.stop());
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
            className="fixed inset-0 z-[300] flex flex-col bg-black"
        >
            <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-6">
                <button
                    onClick={onClose}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl"
                >
                    <X size={24} />
                </button>
                <span className="text-[10px] font-black uppercase italic tracking-[0.3em] text-white">Scanner Mode</span>
                <div className="w-12" />
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                {error ? (
                    <div className="flex flex-col items-center gap-4 px-10 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                        <p className="max-w-xs text-xs font-bold uppercase leading-relaxed tracking-widest text-white">
                            {error}
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-4 rounded-2xl bg-white px-8 py-3 text-[10px] font-black uppercase text-black"
                        >
                            Bezárás
                        </button>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="relative aspect-video w-[80%] rounded-3xl border-2 border-white/20">
                                <div className="border-primary absolute -left-1 -top-1 h-8 w-8 rounded-tl-xl border-l-4 border-t-4" />
                                <div className="border-primary absolute -right-1 -top-1 h-8 w-8 rounded-tr-xl border-r-4 border-t-4" />
                                <div className="border-primary absolute -bottom-1 -left-1 h-8 w-8 rounded-bl-xl border-b-4 border-l-4" />
                                <div className="border-primary absolute -bottom-1 -right-1 h-8 w-8 rounded-br-xl border-b-4 border-r-4" />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {!error && (
                <div className="flex flex-col items-center gap-6 bg-black p-12">
                    <canvas ref={canvasRef} className="hidden" />
                    <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={capturePhoto}
                        className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 p-1"
                    >
                        <div className="h-full w-full rounded-full bg-white shadow-lg" />
                    </motion.button>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Készíts fotót az óráról</p>
                </div>
            )}
        </motion.div>
    );
}