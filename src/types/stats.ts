// src/types/stats.ts

// Meghatározzuk a választható szűrőket
export type MeterFilter = "all" | "villany" | "gaz" | "viz";

// Meghatározzuk a konkrét kategória kulcsokat (szűrő nélkül)
export type CategoryKey = "villany" | "gaz" | "viz";

export interface CategoryData {
    cost: number;
    consumption: number; // Itt az aktuális óraállást tároljuk
    difference?: number; // Ez az aktuális és előző óraállás különbsége, ha van
    unit: string; // Új mező az egységnek
    isOverLimit: boolean; // Új mező a limit túllépésének jelzésére
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
    isOverLimitOverAllPercent: number;
    isTrendPositive: boolean;
}