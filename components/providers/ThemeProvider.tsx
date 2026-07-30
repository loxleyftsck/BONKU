"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useSyncExternalStore,
} from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "bonku-theme";

type ThemeContextValue = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    /** What is actually applied right now, after resolving "system". */
    resolvedTheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/*
 * The preference lives in localStorage, which is an external store, so it is
 * read with useSyncExternalStore rather than mirrored into state from an
 * effect. Subscribers are notified on cross-tab `storage` events, on OS
 * colour-scheme changes, and on our own writes.
 */
const listeners = new Set<() => void>();

function emit() {
    for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", emit);
    window.addEventListener("storage", emit);

    return () => {
        listeners.delete(listener);
        media.removeEventListener("change", emit);
        window.removeEventListener("storage", emit);
    };
}

function readTheme(): Theme {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
}

function getServerSnapshot(): Theme {
    return "system";
}

function resolve(theme: Theme): "light" | "dark" {
    if (theme === "dark") return "dark";
    if (theme === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useSyncExternalStore(subscribe, readTheme, getServerSnapshot);

    // Keep the <html> class in sync with the current preference. The inline
    // script in the root layout has already done this before first paint; this
    // covers subsequent changes.
    useEffect(() => {
        document.documentElement.classList.toggle("dark", resolve(theme) === "dark");
    }, [theme]);

    const setTheme = useCallback((next: Theme) => {
        window.localStorage.setItem(STORAGE_KEY, next);
        emit();
    }, []);

    const resolvedTheme =
        typeof window === "undefined" ? "light" : resolve(theme);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return ctx;
}

/**
 * Applied before paint so a dark-mode user does not get a flash of light UI.
 * Kept deliberately tiny and dependency-free.
 */
export const themeInitScript = `
(function(){try{
var t=localStorage.getItem('${STORAGE_KEY}')||'system';
var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.classList.toggle('dark',d);
}catch(e){}})();
`;
