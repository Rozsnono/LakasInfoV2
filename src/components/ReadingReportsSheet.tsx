"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, FileDown, ChevronRight, Loader2, CalendarX } from "lucide-react";
import { useHouse } from "@/contexts/house.context";
import { getAvailableReportsAction } from "@/app/actions/reading";
import { exportPDF } from "@/lib/pdf-export";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ReportMonth {
  month: string;
  monthNumeric: number;
  year: string;
  isFullYear?: boolean;
}

export default function ReadingReportsSheet({ isOpen, onClose }: Props) {
  const { house } = useHouse();
  const [reports, setReports] = useState<ReportMonth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen && house) {
      // eslint-disable-next-line react-hooks/immutability
      loadAvailableReports();
    }
  }, [isOpen, house]);

  const loadAvailableReports = async () => {
    setIsLoading(true);
    const res = await getAvailableReportsAction(house!._id);
    if (res.success) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setReports(res.value as any);
    }
    setIsLoading(false);
  };

  const handleDownload = async (report: ReportMonth) => {
    if (!house) return;
    const month = report.isFullYear ? { start: 0, end: 11 } : report.monthNumeric;
    await exportPDF(
      {
        house: house,
        isPending: isExporting,
        setIsPending: setIsExporting,
        onReady: () => { },
        date: {
          month: month,
          year: parseInt(report.year)
        },
        containsOptions: {
          isContainedMeterValue: true,
          isContainedMeterDifference: true,
          isContainedReadingDate: true,
          isContainedPriceInfo: false,
          containedMeterTypes: null
        }
      }
    );
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
            className="fixed inset-0 bg-surface/80 backdrop-blur-md z-[150]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl max-h-[80vh] flex flex-col"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />

            <div className="flex items-center justify-between mb-8 px-2 shrink-0">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-black tracking-tight uppercase italic text-text-primary">
                Rezsi <span className="text-primary">jelentések</span>
              </h3>
              <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Adatok lekérése...</span>
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-20 gap-4">
                  <CalendarX size={48} strokeWidth={1} />
                  <p className="text-sm font-bold uppercase tracking-widest">Nincsenek még rögzített adatok</p>
                </div>
              ) : (
                reports.map((report) => (
                  <button
                    key={`${report.month}-${report.year}`}
                    onClick={() => handleDownload(report)}
                    disabled={isExporting}
                    className="w-full flex items-center justify-between p-5 bg-white/5 rounded-[2rem] border border-white/5 active:bg-white/10 disabled:opacity-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center group-active:scale-90 transition-transform">
                        {isExporting ? (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                          <FileDown className="w-6 h-6 text-text-primary/40 group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-black text-base text-text-primary capitalize">{report.month}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-primary/20">
                          {report.year} • PDF LETÖLTÉSE
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-primary/10" />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}