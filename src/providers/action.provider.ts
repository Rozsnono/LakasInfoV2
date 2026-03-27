"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ActionOptions<T, Args extends unknown[]> {
    immediate?: boolean;
    condition?: boolean;
    initialArgs?: Args;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    repeatDelay?: number; // ÚJ: Ismétlési időköz milliszekundumban
}

export function useAction<T, Args extends unknown[]>(
    actionFn: (...args: Args) => Promise<T>,
    options: ActionOptions<T, Args> = {}
) {
    const { immediate = false, condition = true, initialArgs, repeatDelay } = options;

    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isPending, setIsPending] = useState<boolean>(false);

    // 1. TRÜKK: useRef használata a függvényhez és a callbackekhez
    const actionFnRef = useRef(actionFn);
    actionFnRef.current = actionFn;

    const onSuccessRef = useRef(options.onSuccess);
    onSuccessRef.current = options.onSuccess;

    const onErrorRef = useRef(options.onError);
    onErrorRef.current = options.onError;

    const execute = useCallback(
        async (...args: Args): Promise<T | null> => {
            if (!condition) return null;

            setIsPending(true);
            setError(null);

            try {
                // Itt mindig a ref-ből olvassuk ki a függvényt
                const result = await actionFnRef.current(...args);
                setData(result);
                if (result && !(result as unknown as { success: boolean }).success) {
                    onErrorRef.current?.(new Error((result as unknown as { error: string }).error || "Ismeretlen hiba"));
                    return result;
                }
                onSuccessRef.current?.(result);
                return result;
            } catch (e: unknown) {
                const err = e instanceof Error ? e : new Error(String(e));
                setError(err);
                onErrorRef.current?.(err);
                throw err;
            } finally {
                setIsPending(false);
            }
        },
        [condition] // Az execute MOST MÁR STABIL, csak a condition változására reagál
    );

    // 2. TRÜKK: Stringify az argumentumokra
    const argsHash = JSON.stringify(initialArgs);

    // ÚJ: Kombinált useEffect az azonnali futtatáshoz ÉS a pollinghoz (ismétlődéshez)
    useEffect(() => {
        if (!condition) return;

        const args = initialArgs ?? ([] as unknown as Args);

        // 1. Azonnali lekérés (ha kérjük)
        if (immediate) {
            execute(...args).catch(() => {
                // A hibát fent már kezeljük
            });
        }

        // 2. Ismétlődés beállítása (ha van megadva repeatDelay)
        if (repeatDelay && repeatDelay > 0) {
            const intervalId = setInterval(() => {
                execute(...args).catch(() => { });
            }, repeatDelay);

            // Tisztítás: ha a komponens megsemmisül, vagy változik egy paraméter, kilőjük az interval-t
            return () => clearInterval(intervalId);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [immediate, condition, execute, argsHash, repeatDelay]);

    return { data, error, isPending, execute };
}