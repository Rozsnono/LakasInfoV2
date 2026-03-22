"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSettingsAction, updateSettingsAction } from "@/app/actions/settings";

export const WALLPAPERS = [
    { id: "v1", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #490c25 100%)" },
    { id: "v2", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #0c1b40 100%)" },
    { id: "v3", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #200b38 100%)" },
    { id: "v4", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #062e22 100%)" },
    { id: "v5", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #082d38 100%)" },
    { id: "v6", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #40100c 100%)" },
    { id: "v7", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #362208 100%)" },
    { id: "v8", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #12103b 100%)" },
    { id: "a1", category: "Absztrakt", css: "linear-gradient(-45deg, #020617, #1e1b4b, #312e81, #020617)", animated: true },
    { id: "a2", category: "Absztrakt", css: "radial-gradient(circle at 20% 30%, #4c1d95 0%, transparent 50%), radial-gradient(circle at 80% 70%, #2e1065 0%, transparent 50%), #000", animated: true },
    { id: "a3", category: "Absztrakt", css: "radial-gradient(ellipse at 50% 50%, #1e3a8a 0%, #020617 60%, #000 100%)", animated: true },
    { id: "a4", category: "Absztrakt", css: "linear-gradient(115deg, #020617, #064e3b, #0ea5e9, #020617)", animated: true },
    { id: "a5", category: "Absztrakt", css: "radial-gradient(circle at 0% 0%, #334155 0%, transparent 40%), radial-gradient(circle at 100% 100%, #1e293b 0%, transparent 40%), radial-gradient(circle at 50% 50%, #0f172a 0%, transparent 60%), #000", animated: true },
    { id: "a6", category: "Absztrakt", css: "radial-gradient(circle at 80% 20%, #701a75 0%, transparent 50%), radial-gradient(circle at 20% 80%, #4a044e 0%, transparent 50%), #020617", animated: true },
    { id: "a7", category: "Absztrakt", css: "radial-gradient(ellipse at 0% 100%, #7f1d1d 0%, #450a0a 40%, #000 80%)", animated: true },
    { id: "a8", category: "Absztrakt", css: "radial-gradient(circle at 100% 0%, #059669 0%, transparent 60%), radial-gradient(circle at 0% 100%, #0891b2 0%, transparent 60%), #020617", animated: true },
    { id: "s1", category: "Színek", css: "radial-gradient(circle at 10% 20%, #3b82f6 0%, transparent 40%), radial-gradient(circle at 90% 80%, #ec4899 0%, transparent 40%), radial-gradient(circle at 50% 50%, #8b5cf6 0%, transparent 60%), #000", animated: true },
    { id: "s2", category: "Színek", css: "radial-gradient(circle at 0% 100%, #ea580c 0%, transparent 50%), radial-gradient(circle at 100% 0%, #ca8a04 0%, transparent 50%), radial-gradient(circle at 50% 50%, #b91c1c 0%, transparent 60%), #020617", animated: true },
    { id: "s3", category: "Színek", css: "radial-gradient(circle at 80% 20%, #10b981 0%, transparent 45%), radial-gradient(circle at 20% 80%, #06b6d4 0%, transparent 45%), radial-gradient(circle at 50% 50%, #1e3a8a 0%, transparent 60%), #000", animated: true },
    { id: "s4", category: "Színek", css: "radial-gradient(circle at 0% 0%, #00ffcc 0%, transparent 35%), radial-gradient(circle at 100% 100%, #a855f7 0%, transparent 35%), radial-gradient(circle at 50% 50%, #4c1d95 0%, transparent 60%), #050505", animated: true },
    { id: "s5", category: "Színek", css: "radial-gradient(circle at 10% 90%, #0c4a6e 0%, transparent 50%), radial-gradient(circle at 90% 10%, #1e3a8a 0%, transparent 50%), radial-gradient(circle at 50% 50%, #042f2e 0%, transparent 60%), #020617", animated: true },
    { id: "s6", category: "Színek", css: "radial-gradient(circle at 20% 20%, #991b1b 0%, transparent 40%), radial-gradient(circle at 80% 80%, #f59e0b 0%, transparent 40%), radial-gradient(circle at 50% 50%, #450a0a 0%, transparent 70%), #000", animated: true },
    { id: "s7", category: "Színek", css: "radial-gradient(circle at 0% 50%, #4c1d95 0%, transparent 40%), radial-gradient(circle at 100% 50%, #be185d 0%, transparent 40%), radial-gradient(circle at 50% 0%, #1e3a8a 0%, transparent 50%), #020617", animated: true },
    { id: "s8", category: "Színek", css: "radial-gradient(circle at 100% 100%, #14b8a6 0%, transparent 50%), radial-gradient(circle at 0% 0%, #db2777 0%, transparent 50%), radial-gradient(circle at 50% 50%, #172554 0%, transparent 60%), #000", animated: true },
    { id: "u1", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\"), linear-gradient(135deg, #0f172a 0%, #000 100%)" },
    { id: "u2", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\"), linear-gradient(135deg, #450a0a 0%, #000 100%)" },
    { id: "u3", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\"), linear-gradient(135deg, #064e3b 0%, #000 100%)" },
    { id: "u4", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\"), linear-gradient(135deg, #1e1b4b 0%, #000 100%)" },
    { id: "u5", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\"), linear-gradient(135deg, #422006 0%, #000 100%)" },
    { id: "u6", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\"), linear-gradient(135deg, #171717 0%, #000 100%)" },
    { id: "u7", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\"), #000" },
    { id: "u8", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\"), linear-gradient(to bottom, #111, #000)" },
    { id: "m1", category: "Minimalista", css: "linear-gradient(to bottom, #0a0a0a, #000)" },
    { id: "m2", category: "Minimalista", css: "linear-gradient(to bottom, #171717, #0a0a0a)" },
    { id: "m3", category: "Minimalista", css: "linear-gradient(to bottom, #020617, #000)" },
    { id: "m4", category: "Minimalista", css: "#000" },
    { id: "m5", category: "Minimalista", css: "radial-gradient(circle at center, #1a1a1a 0%, #000 100%)" },
    { id: "m6", category: "Minimalista", css: "linear-gradient(180deg, #0c0a09 0%, #000 100%)" },
    { id: "m7", category: "Minimalista", css: "linear-gradient(to right, #000, #111, #000)" },
    { id: "m8", category: "Minimalista", css: "linear-gradient(45deg, #050505, #111)" },
];

export const CATEGORIES = ["Világító", "Absztrakt", "Színek", "Üveg", "Minimalista"];

interface AppearanceContextType {
    theme: "dark" | "light" | "system";
    accent: string;
    animations: boolean;
    wallpaper: string;
    widgets: { [houseId: string]: string[] };
    setTheme: (t: "dark" | "light" | "system") => void;
    setAccent: (a: string) => void;
    setAnimations: (enabled: boolean) => void;
    setWallpaper: (id: string) => void;
    setWidgets: (widgets: { [houseId: string]: string[] }) => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children, initialValues }: {
    children: React.ReactNode;
    initialValues: { theme: string | undefined; accent: string | undefined; animations: string | undefined; wallpaper: string | undefined; widgets: { [houseId: string]: string[] } | undefined }
}) {
    const [theme, setThemeState] = useState<"dark" | "light" | "system">(initialValues.theme as "dark" | "light" | "system" || "dark");
    const [accent, setAccentState] = useState(initialValues.accent || "#ff3b30");
    const [animations, setAnimationsState] = useState(initialValues.animations !== "false");
    const [wallpaper, setWallpaperState] = useState(initialValues.wallpaper || "v1");
    const [widgets, setWidgetsState] = useState(initialValues.widgets || {});

    const setterThemeState = (t: "dark" | "light" | "system") => {
        setThemeState(t);
        saveCookie("app_theme", t);
        updateSettingsAction({ theme: t, accent, animations, wallpaper, widgets });
    }

    const setterAccentState = (a: string) => {
        setAccentState(a);
        saveCookie("app_accent", a);
        updateSettingsAction({ theme, accent: a, animations, wallpaper, widgets });
    }

    const setterAnimationsState = (en: boolean) => {
        setAnimationsState(en);
        saveCookie("app_animations", en.toString());
        updateSettingsAction({ theme, accent, animations: en, wallpaper, widgets });
    }

    const setterWallpaperState = (id: string) => {
        setWallpaperState(id);
        saveCookie("app_wallpaper", id);
        updateSettingsAction({ theme, accent, animations, wallpaper: id, widgets });
    }

    const setterWidgetsState = (w: { [houseId: string]: string[] }) => {
        setWidgetsState(w);
        saveCookie("app_widgets", JSON.stringify(w));
        updateSettingsAction({ theme, accent, animations, wallpaper, widgets: w });
    }


    const saveCookie = (name: string, value: string) => {
        if (typeof document !== "undefined") {
            document.cookie = `${name}=${value}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            if (!initialValues.theme && !initialValues.accent && !initialValues.wallpaper) {
                const res = await getSettingsAction();
                if (res.success && res.settings) {
                    const { theme: t, accent: a, animations: anim, wallpaper: wp, widgets: widg } = res.settings;

                    if (t) { setThemeState(t as "dark" | "light" | "system"); saveCookie("app_theme", t); }
                    if (a) { setAccentState(a); saveCookie("app_accent", a); }
                    if (anim !== undefined) { setAnimationsState(anim); saveCookie("app_animations", anim.toString()); }
                    if (wp) { setWallpaperState(wp); saveCookie("app_wallpaper", wp); }
                    if (widg) { setWidgetsState(widg); saveCookie("app_widgets", JSON.stringify(widg)); }
                }
            }
        };

        fetchSettings();
    }, [initialValues]);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--brand-primary", accent);
        root.style.setProperty("--brand-accent-red", `${accent}33`);

        const selectedWp = WALLPAPERS.find(w => w.id === wallpaper);
        const bgValue = selectedWp ? selectedWp.css : WALLPAPERS[0].css;
        const isAnimated = selectedWp?.animated === true && animations;

        root.style.setProperty("--app-wallpaper", bgValue);
        root.style.setProperty("--app-bg-size", isAnimated ? "300% 300%" : "cover");
        root.style.setProperty("--app-bg-animation", isAnimated ? "moveAbstractGradient 20s ease-in-out infinite alternate" : "none");

        if (!animations) root.classList.add("no-animations");
        else root.classList.remove("no-animations");

        root.classList.toggle("dark", theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches));
    }, [theme, accent, animations, wallpaper]);

    return (
        <AppearanceContext.Provider value={{
            theme, accent, animations, wallpaper, widgets,
            setTheme: setterThemeState,
            setAccent: setterAccentState,
            setAnimations: setterAnimationsState,
            setWallpaper: setterWallpaperState,
            setWidgets: setterWidgetsState
        }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes moveAbstractGradient {
                    0% { background-position: 0% 0%; }
                    33% { background-position: 100% 0%; }
                    66% { background-position: 100% 100%; }
                    100% { background-position: 0% 100%; }
                }
            `}} />
            {children}
        </AppearanceContext.Provider>
    );
}

export const useAppearance = () => {
    const context = useContext(AppearanceContext);
    if (!context) throw new Error("useAppearance must be used within AppearanceProvider");
    return context;
};