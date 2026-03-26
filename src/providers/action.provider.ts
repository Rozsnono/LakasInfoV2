"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ActionOptions<T, Args extends unknown[]> {
    immediate?: boolean;
    condition?: boolean;
    initialArgs?: Args;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

export function useAction<T, Args extends unknown[]>(
    actionFn: (...args: Args) => Promise<T>,
    options: ActionOptions<T, Args> = {}
) {
    const { immediate = false, condition = true, initialArgs } = options;

    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isPending, setIsPending] = useState<boolean>(false);

    // 1. TRÜKK: useRef használata a függvényhez és a callbackekhez
    // Így mindig a legfrissebb függvényt hívjuk, de a referencia nem változik minden rendernél
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
                    onErrorRef.current?.(new Error((result as unknown as { message: string }).message || "Ismeretlen hiba"));
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
    // Ezzel átalakítjuk a tömböt egy stringgé (pl. '["userId123"]'). 
    // Így a React csak akkor indítja újra a lekérést, ha a userId TÉNYLEG megváltozott.
    const argsHash = JSON.stringify(initialArgs);

    useEffect(() => {
        if (immediate && condition) {
            const args = initialArgs ?? ([] as unknown as Args);

            execute(...args).catch(() => {
                // A hibát fent már kezeljük
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [immediate, condition, execute, argsHash]); // <-- Itt az argsHash menti meg a napot!

    return { data, error, isPending, execute };
}