"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export default function NativeBackButton() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const setupListener = async () => {
            const listener = await CapacitorApp.addListener("backButton", () => {
                const exitPaths = ["/dashboard", "/login", "/onboarding", "/"];

                if (exitPaths.includes(pathname)) {
                    CapacitorApp.exitApp();
                } else {
                    router.back();
                }
            });

            return listener;
        };

        const listenerPromise = setupListener();

        return () => {
            listenerPromise.then((listener) => {
                if (listener) {
                    listener.remove();
                }
            });
        };
    }, [router, pathname]);

    return null;
}