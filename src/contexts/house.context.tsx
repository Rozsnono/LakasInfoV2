"use client";

import mongoose from "mongoose";
import React, { createContext, useContext } from "react";

// Csak a frontend számára releváns adatokat tesszük ide, Mongoose sallangok nélkül
export interface HouseData {
    _id: string;
    name: string;
    address?: string;
    inviteCode?: string;
    members: string[] | mongoose.Types.ObjectId[]; // Csak ID-k, hogy ne legyen túl sok adat a contextben
}

interface HouseContextType {
    house: HouseData | null;
}

const HouseContext = createContext<HouseContextType | undefined>(undefined);

export function HouseProvider({
    children,
    house,
}: {
    children: React.ReactNode;
    house: HouseData | null;
}) {
    return (
        <HouseContext.Provider value={{ house }
        }>
            {children}
        </HouseContext.Provider>
    );
}

// Custom hook a kényelmes használathoz
export function useHouse() {
    const context = useContext(HouseContext);
    if (context === undefined) {
        throw new Error("A useHouse hookot csak a HouseProvider-en belül lehet használni!");
    }
    return context;
}