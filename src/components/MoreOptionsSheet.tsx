"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { FileDown, Settings, Users, PenTool, CheckCircle, ChevronLeft, FileSpreadsheet, Printer } from "lucide-react";
import { useRouter } from "@/contexts/router.context";
import { HouseData, useHouse } from "@/contexts/house.context";
import { getAllReadingsAction } from "@/app/actions/reading";
import { ReadingWithMeterInfo } from "@/services/reading.service";
import Link from "@/contexts/router.context";
import { exportPDF } from "@/lib/pdf-export";
import { exportCsv } from "@/lib/csv-export";

interface MoreOptionsSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const sheetVariants: Variants = {
    hidden: { y: "100%" },
    visible: {
        y: 0,
        transition: { type: "spring", damping: 25, stiffness: 200 },
    },
    exit: {
        y: "100%",
        transition: { duration: 0.3 },
    },
};

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

export default function MoreOptionsSheet({ isOpen, onClose }: MoreOptionsSheetProps) {
    const router = useRouter();
    const { house } = useHouse();
    const [isExporting, setIsExporting] = useState(false);
    const [exportDone, setExportDone] = useState(false);

    const handleNavigation = (path: string) => {
        onClose();
        setTimeout(() => {
            router.push(path);
        }, 150);
    };

    const handleExportCSV = async () => {
        await exportCsv(house as HouseData, isExporting, setIsExporting, onClose);
    }

    const handlePrint = async () => {
        await exportPDF(house as HouseData, isExporting, setIsExporting, onClose);
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={!isExporting ? onClose : undefined}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]"
                    />
                    <motion.div
                        variants={sheetVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />

                        <div className="flex items-center justify-between mb-8 px-2 shrink-0">
                            <button
                                onClick={onClose}
                                disabled={isExporting}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-20"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <h3 className="text-xl font-black tracking-tight text-white uppercase italic">Műve<span className="text-primary">letek</span></h3>
                            <div className="w-10" />
                        </div>

                        <div className="flex-1 overflow-y-auto px-2 scrollbar-hide relative flex flex-col gap-3">
                            <AnimatePresence>
                                {exportDone && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute inset-0 z-50 bg-surface flex flex-col items-center justify-center gap-4 text-center"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <CheckCircle className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <span className="text-white font-black text-xl block uppercase italic">Sikeres exportálás!</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <OptionItem
                                icon={<FileSpreadsheet className="w-6 h-6 text-emerald-500" />}
                                label={isExporting ? "Exportálás..." : "Adat-export (CSV)"}
                                sub="Excel és Google Sheets barát"
                                onClick={handleExportCSV}
                                isLoading={isExporting}
                            />

                            <OptionItem
                                icon={<Printer className="w-6 h-6 text-blue-400" />}
                                label="Nyomtatás / PDF"
                                sub="Lista mentése vagy nyomtatása"
                                onClick={handlePrint}
                                isLoading={isExporting}
                            />

                            <div className="h-px w-full bg-white/5 my-2" />

                            <Link href={'/dashboard/roommates'} >
                                <OptionItem
                                    icon={<Users className="w-6 h-6 text-white/60" />}
                                    label="Lakótársak"
                                    sub="Tagok kezelése és meghívás"
                                    onClick={() => { }}
                                />
                            </Link>

                            <Link href={'/dashboard/settings'}>
                                <OptionItem
                                    icon={<Settings className="w-6 h-6 text-white/60" />}
                                    label="Ház beállításai"
                                    sub="Cím és fogyasztási keretek"
                                    onClick={() => { }}
                                />
                            </Link>

                            <Link href={'/dashboard/appearance'}>
                                <OptionItem
                                    icon={<PenTool className="w-6 h-6 text-white/60" />}
                                    label="Megjelenés"
                                    sub="Sötét mód és színek"
                                    onClick={() => { }}
                                />
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

interface OptionItemProps {
    icon: React.ReactNode;
    label: string;
    sub: string;
    onClick: () => void;
    isLoading?: boolean;
}

function OptionItem({ icon, label, sub, onClick, isLoading }: OptionItemProps) {
    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            disabled={isLoading}
            className="w-full bg-white/5 p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between transition-all active:bg-white/10 group disabled:opacity-50"
        >
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-surface-elevated flex items-center justify-center shrink-0 border border-white/5 group-active:scale-90 transition-transform shadow-inner">
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                        icon
                    )}
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-white font-black text-[17px] tracking-tight leading-tight">{label}</span>
                    <span className="text-white/30 text-[11px] font-bold uppercase tracking-wider mt-1">{sub}</span>
                </div>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft className="w-5 h-5 text-white rotate-180" />
            </div>
        </motion.button>
    );
}