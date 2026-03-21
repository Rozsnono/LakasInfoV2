// src/types/stats.ts

// Meghatározzuk a választható szűrőket
export type MeterFilter = "all" | "villany" | "gaz" | "viz";

// Meghatározzuk a konkrét kategória kulcsokat (szűrő nélkül)
export type CategoryKey = "villany" | "gaz" | "viz";

export interface CategoryData {
    cost: number;
    consumption: number; // Itt az aktuális óraállást tároljuk
    unit: string; // Új mező az egységnek
}

export interface Breakdown {
    [key: string]: CategoryData;
}

export interface ChartPoint {
    label: string;
    cost: number;        // Összesített havi költség
    consumption: number; // Összesített havi óraállás
    unit: string;        // Összesített havi egység
    breakdown: Breakdown;
    sortKey: number;
    monthlyDiffSum: number;
}

export interface DetailedStatsData {
    chartData: ChartPoint[];
    categoryKeys: CategoryKey[];
    totalCost: string;
    totalConsumption: string;
    trend: string;
    isTrendPositive: boolean;
}