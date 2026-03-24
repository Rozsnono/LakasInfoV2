"use client";

import React, { createContext, useContext, useEffect } from "react";
import { StartupAction } from "@/app/actions/startup";

interface StartupContextType {
    isLoading: boolean;
}

const StartupContext = createContext<StartupContextType | undefined>(undefined);

export function StartupProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        async function initialize() {
            setIsLoading(true);
            await StartupAction();
            setIsLoading(false);
        }
        initialize();
    }, []);

    return (
        <StartupContext.Provider value={{ isLoading }}>
            {children}
        </StartupContext.Provider>
    );
}   