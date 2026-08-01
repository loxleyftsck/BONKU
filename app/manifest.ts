import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "BONKU — Catatan Keuangan",
        short_name: "BONKU",
        description:
            "Catat pemasukan dan pengeluaranmu, lalu pahami ke mana uangmu pergi.",
        start_url: "/dashboard",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#3461c9",
        lang: "id",
        categories: ["finance", "productivity"],
        icons: [
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            // Android crops maskable icons to its own shape; the motif is kept
            // inside the central safe zone so nothing important is cut off.
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
