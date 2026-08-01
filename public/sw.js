/*
 * BONKU service worker — read-only offline.
 *
 * Deliberately conservative for a finance app:
 *   - Only GET is ever cached. Writes always go to the network, so a
 *     transaction can never be silently swallowed and lost.
 *   - API responses are network-first: fresh figures win, and the cache is
 *     only a fallback when the network fails. Serving stale money numbers as
 *     if they were current would be worse than showing nothing.
 *   - A cached API response is marked with a header so the UI can tell the
 *     user what they are looking at is not live.
 */

const VERSION = "bonku-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const DATA_CACHE = `${VERSION}-data`;
const OFFLINE_URL = "/offline";

const SHELL_ASSETS = [
    OFFLINE_URL,
    "/icons/icon-192.png",
    "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(SHELL_CACHE)
            .then((cache) => cache.addAll(SHELL_ASSETS))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((k) => !k.startsWith(VERSION))
                        .map((k) => caches.delete(k)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

function isApi(url) {
    return url.pathname.startsWith("/api/");
}

/** Network-first, falling back to the last good cached copy. */
async function apiStrategy(request) {
    const cache = await caches.open(DATA_CACHE);

    try {
        const fresh = await fetch(request);
        if (fresh.ok) {
            cache.put(request, fresh.clone());
        }
        return fresh;
    } catch {
        const cached = await cache.match(request);
        if (!cached) throw new Error("offline and nothing cached");

        // Flag it so the interface can say the figures are not live.
        const headers = new Headers(cached.headers);
        headers.set("x-bonku-from-cache", "1");

        return new Response(cached.body, {
            status: cached.status,
            statusText: cached.statusText,
            headers,
        });
    }
}

/** Cache-first for static assets, network-first for pages. */
async function pageStrategy(request) {
    try {
        return await fetch(request);
    } catch {
        const cache = await caches.open(SHELL_CACHE);
        const cached = await cache.match(request);
        return cached ?? (await cache.match(OFFLINE_URL));
    }
}

self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Never interfere with writes. An offline POST must fail loudly.
    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Auth must always hit the network; a cached session check is a security
    // hazard.
    if (url.pathname.startsWith("/api/auth/")) return;

    event.respondWith(isApi(url) ? apiStrategy(request) : pageStrategy(request));
});
