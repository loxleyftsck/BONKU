"use client";

import { useEffect } from "react";

/**
 * Registers the service worker.
 *
 * Development is excluded: a cache layer between you and your own edits makes
 * changes appear not to apply, which costs more time than the offline support
 * saves while building.
 */
export function ServiceWorkerProvider() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") return;
        if (!("serviceWorker" in navigator)) return;

        navigator.serviceWorker.register("/sw.js").catch((error) => {
            console.error("Service worker registration failed", error);
        });
    }, []);

    return null;
}
