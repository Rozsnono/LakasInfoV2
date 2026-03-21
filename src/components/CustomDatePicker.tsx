"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];
const DAYS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

interface CustomDatePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    disabled?: boolean;
}

export default function CustomDatePicker({ value, onChange, disabled }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState<Date>(value);

    // Formázott dátum megjelenítése a gombon (pl. "2026. Március 19.")
    const formattedDate = `${value.getFullYear()}. ${MONTHS[value.getMonth()]} ${value.getDate()}.`;

    // Naptár logikák
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

    // Hétfői hétkezdés számítása
    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number) => {
        onChange(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
        setIsOpen(false); // Automatikusan bezárjuk kiválasztás után
    };

    const isSameDate = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    };

    const renderCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Üres cellák a hónap elején
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8 flex-shrink-0"></div>);
        }

        // Napok
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDay = new Date(year, month, i);
            const isSelected = isSameDate(currentDay, value);
            const isToday = isSameDate(currentDay, new Date());

            days.push(
                <button
                    key={`day-${i}`}
                    onClick={(e) => { e.preventDefault(); handleDateSelect(i); }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                        ${isSelected ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,59,48,0.4)] scale-110' :
                            isToday ? 'border border-primary/50 text-primary' :
                                'text-white/60 hover:bg-white/10 hover:text-white active:scale-90'}`}
                >
                    {i}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="relative w-full flex flex-col gap-2">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className="w-full flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl py-4 px-5 text-white font-bold transition-all active:scale-[0.98] disabled:opacity-50"
            >
                <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-white/40" />
                    <span className="text-sm">{formattedDate}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden bg-surface-elevated border border-white/10 rounded-2xl shadow-2xl z-[70] backdrop-blur-xl"
                    >
                        <div className="p-4 flex flex-col gap-4">
                            {/* Naptár Fejléc */}
                            <div className="flex items-center justify-between">
                                <button onClick={handlePrevMonth} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <ChevronLeft className="w-4 h-4 text-white" />
                                </button>
                                <span className="text-sm font-black uppercase tracking-widest text-white">
                                    {viewDate.getFullYear()} {MONTHS[viewDate.getMonth()]}
                                </span>
                                <button onClick={handleNextMonth} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <ChevronRight className="w-4 h-4 text-white" />
                                </button>
                            </div>

                            {/* Naptár Napok Fejléc */}
                            <div className="grid grid-cols-7 gap-1 text-center mb-1">
                                {DAYS.map(day => (
                                    <span key={day} className="text-[10px] font-black uppercase text-white/30">{day}</span>
                                ))}
                            </div>

                            {/* Naptár Grid */}
                            <div className="grid grid-cols-7 gap-1 justify-items-center">
                                {renderCalendarDays()}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}