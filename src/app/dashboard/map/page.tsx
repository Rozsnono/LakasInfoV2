"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Home, Navigation, MapPin, Loader2 } from "lucide-react";
import Link from "@/contexts/router.context";
import { useAction } from "@/providers/action.provider";
import { getUserHousesAction } from "@/app/actions/house";

export interface MapHouse {
    _id: string;
    name: string;
    address?: string;
    distance?: string;
}

interface MapPageClientProps {
    houses: MapHouse[];
}

export default function MapPageClient() {
    const [activeHouse, setActiveHouse] = useState<MapHouse | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(true);
    const [houses, setHouses] = useState<MapHouse[]>([]);

    const { isPending, error, execute } = useAction(getUserHousesAction, {
        immediate: true,
        onSuccess: (result) => {
            if (result.success && result.houses && result.houses.length > 0) {
                setActiveHouse(result.houses[0]);
                setHouses(result.houses);
            }
        }
    });

    const handleLocateMe = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                alert(`Helyzeted: ${position.coords.latitude}, ${position.coords.longitude}\n(Navigáció fejlesztés alatt)`);
            });
        }
    };

    const handleSelectHouse = (house: MapHouse) => {
        setActiveHouse(house);
        setIsSheetOpen(false);
    };

    return (
        <div className="relative min-h-screen bg-surface overflow-hidden flex flex-col">

            {/* Vissza gomb a térkép felett lebegve */}
            <div className="absolute top-12 left-4 z-50">
                <Link
                    href="/dashboard"
                    className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-2xl active:scale-90 transition-transform"
                >
                    <ArrowLeft className="w-6 h-6 text-text-primary" />
                </Link>
            </div>

            {/* Navigációs gomb */}
            <div className="absolute top-32 right-4 z-50">
                <button
                    onClick={handleLocateMe}
                    className="w-14 h-14 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] active:scale-90 transition-transform"
                >
                    <Navigation className="w-6 h-6 text-text-primary" fill="white" />
                </button>
            </div>

            {/* A Térkép Háttere */}
            <div className="absolute inset-0 h-screen bg-[#1a1a1a]">
                {isPending ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-primary/50">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest">Térkép betöltése...</span>
                    </div>
                ) : error ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-red-500/50 gap-2">
                        <MapPin className="w-8 h-8 opacity-50" />
                        <span className="text-xs font-black uppercase tracking-widest">Hiba a betöltéskor</span>
                    </div>
                ) : !activeHouse ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-primary/30 gap-2">
                        <MapPin className="w-8 h-8 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-widest">Nincs megjeleníthető térkép</span>
                    </div>
                ) : activeHouse.address ? (
                    <div className="relative w-full h-full">
                        <iframe
                            key={activeHouse._id}
                            title="House Map"
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(activeHouse.address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                            className="w-full h-full"
                            style={{ filter: 'invert(90%) hue-rotate(180deg) brightness(80%) contrast(120%) grayscale(60%)' }}
                            frameBorder="0"
                        />

                        {/* Láthatatlan overlay a kattintás lekezelésére */}
                        <AnimatePresence>
                            {isSheetOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-10 bg-surface/10"
                                    onClick={() => setIsSheetOpen(false)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-primary/30 gap-2">
                        <MapPin className="w-8 h-8 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-widest">Nincs cím megadva</span>
                    </div>
                )}
            </div>

            {/* A felcsúszó Bottom Sheet (Alsó panel) */}
            <motion.div
                initial={false}
                animate={{ y: isSheetOpen ? "0%" : "calc(100% - 8rem)" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 h-[50vh] bg-[#121212] rounded-t-[2.5rem] shadow-[0_-30px_50px_rgba(0,0,0,0.8)] flex flex-col z-40 border-t border-white/5"
            >
                {/* Kattintható fejléc / Behúzó zóna */}
                <div
                    className="w-full pt-5 pb-5 cursor-pointer shrink-0"
                    onClick={() => setIsSheetOpen(!isSheetOpen)}
                >
                    <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto" />
                </div>

                {/* Lista */}
                {isSheetOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.1 } }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-2"
                    >
                        <AnimatePresence mode="wait">
                            {isPending ? (
                                /* TÖLTÉS ÁLLAPOT */
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 flex flex-col items-center justify-center gap-3 py-10"
                                >
                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                    <p className="text-text-primary/30 text-[10px] font-bold uppercase tracking-widest">Helyszínek keresése...</p>
                                </motion.div>
                            ) : error ? (
                                /* HIBA ÁLLAPOT */
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 flex flex-col items-center justify-center gap-3 py-10"
                                >
                                    <p className="text-red-400 text-[11px] font-bold">Hiba történt a betöltéskor.</p>
                                    <button onClick={() => execute()} className="text-primary text-[10px] font-black uppercase tracking-widest underline">Újrapróbálkozás</button>
                                </motion.div>
                            ) : houses.length > 0 ? (
                                /* ADATOK MEGJELENÍTÉSE */
                                <motion.div key="content" className="flex flex-col gap-2">
                                    {houses.map((house) => {
                                        const isActive = activeHouse?._id === house._id;

                                        return (
                                            <div
                                                key={house._id}
                                                onClick={() => handleSelectHouse(house)}
                                                className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer group ${isActive
                                                    ? "bg-white/10 border border-white/10 shadow-lg"
                                                    : "active:bg-white/5 border border-transparent"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 group-active:scale-95 transition-transform ${isActive ? "bg-primary border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-[#1A1A1A] border-white/5"
                                                        }`}>
                                                        <Home className={`w-5 h-5 ${isActive ? "text-text-primary" : "text-text-primary/60"}`} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-text-primary font-bold text-lg leading-tight">{house.name}</span>
                                                        <span className="text-text-primary/40 text-xs font-medium mt-1 truncate max-w-[200px]">{house.address || "Nincs cím"}</span>
                                                    </div>
                                                </div>
                                                {house.distance && (
                                                    <span className="text-text-primary/60 text-sm font-medium shrink-0 ml-2">Táv: {house.distance}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                /* ÜRES ÁLLAPOT */
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 flex items-center justify-center text-text-primary/30 text-xs font-bold uppercase tracking-widest text-center px-6 pb-10"
                                >
                                    Nincsenek megjeleníthető háztartások
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}