import { useCallback, useEffect, useRef } from "react";

const DEFAULT_DELAY_MS = 300;

const useDebouncedCallback = (callback, delayMs = DEFAULT_DELAY_MS) => {
    const callbackRef = useRef(callback);
    const timeoutRef = useRef(null);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const debounced = useCallback(
        (...args) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delayMs);
        },
        [delayMs]
    );

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debounced;
};

export { useDebouncedCallback };
