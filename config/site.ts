export const siteConfig = {
    name: "BONKU",
    description:
        "Catat pemasukan dan pengeluaranmu, lalu pahami ke mana uangmu pergi.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    tagline: "Catatan keuangan sederhana untuk Indonesia",
    keywords: [
        "financial management",
        "budgeting",
        "Indonesia",
        "personal finance",
        "inflation tracking",
    ],
    creator: "BONKU Team",
    version: "5.1.0",
} as const;
