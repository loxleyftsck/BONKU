import { DEMO_USER } from "./config";
import type { EducationModule, Transaction } from "@/types/models";

/**
 * In-memory demo dataset.
 *
 * State lives in the server process, so it resets when the dev server
 * restarts. That is deliberate: a demo should be reproducible, and persisting
 * it would mean inventing a storage layer that production does not use.
 */

function toLocalISO(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * A date on `day` of the month `offset` months from now.
 *
 * Anchoring to the calendar month rather than "n days ago" is deliberate: the
 * dashboard compares this month against last month, and on the 1st of a month
 * a days-ago seed puts every row in the previous month, leaving the current
 * month empty and every trend reading −100%.
 *
 * Days past today are clamped, so the demo never contains a future-dated
 * transaction — which the validator rejects for real input.
 */
function inMonth(offset: number, day: number): string {
    const now = new Date();
    const anchor = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const lastDay = new Date(
        anchor.getFullYear(),
        anchor.getMonth() + 1,
        0,
    ).getDate();

    const candidate = new Date(
        anchor.getFullYear(),
        anchor.getMonth(),
        Math.min(day, lastDay),
    );

    return toLocalISO(candidate > now ? now : candidate);
}

const thisMonth = (day: number) => inMonth(0, day);
const lastMonth = (day: number) => inMonth(-1, day);

function uuid(): string {
    return crypto.randomUUID();
}

function tx(
    partial: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">,
): Transaction {
    const now = new Date().toISOString();
    return {
        id: uuid(),
        user_id: DEMO_USER.id,
        created_at: now,
        updated_at: now,
        ...partial,
    };
}

/**
 * Seeded across this month and last, so the month-over-month comparison has a
 * real baseline instead of rendering "Belum ada pembanding".
 */
function seedTransactions(): Transaction[] {
    return [
        // ---- current month
        // Shaped like the audience the product is for: a young earner with a
        // thin margin, one category running away, and real impulse spending —
        // not someone banking half their salary.
        tx({ type: "income", amount: 6_500_000, category: "salary", description: "Gaji bulanan", date: thisMonth(25), is_recurring: true, behavior_tag: null }),
        tx({ type: "expense", amount: 1_800_000, category: "housing", description: "Sewa kos", date: thisMonth(2), is_recurring: true, behavior_tag: "essential" }),
        tx({ type: "expense", amount: 1_450_000, category: "food", description: "Belanja bulanan", date: thisMonth(6), is_recurring: false, behavior_tag: "planned" }),
        tx({ type: "expense", amount: 380_000, category: "transportation", description: "Bensin dan ojek online", date: thisMonth(9), is_recurring: false, behavior_tag: "essential" }),
        tx({ type: "expense", amount: 450_000, category: "entertainment", description: "Nonton dan nongkrong", date: thisMonth(12), is_recurring: false, behavior_tag: "impulsive" }),
        tx({ type: "expense", amount: 300_000, category: "food", description: "Makan di luar", date: thisMonth(16), is_recurring: false, behavior_tag: "impulsive" }),
        tx({ type: "expense", amount: 620_000, category: "shopping", description: "Sepatu diskon", date: thisMonth(18), is_recurring: false, behavior_tag: "impulsive" }),
        tx({ type: "expense", amount: 99_000, category: "bills", description: "Langganan internet", date: thisMonth(20), is_recurring: true, behavior_tag: "essential" }),

        // ---- previous month, so trends have a baseline
        tx({ type: "income", amount: 6_500_000, category: "salary", description: "Gaji bulanan", date: lastMonth(25), is_recurring: true, behavior_tag: null }),
        tx({ type: "expense", amount: 1_800_000, category: "housing", description: "Sewa kos", date: lastMonth(2), is_recurring: true, behavior_tag: "essential" }),
        tx({ type: "expense", amount: 1_000_000, category: "food", description: "Belanja bulanan", date: lastMonth(6), is_recurring: false, behavior_tag: "planned" }),
        tx({ type: "expense", amount: 350_000, category: "transportation", description: "Transportasi", date: lastMonth(11), is_recurring: false, behavior_tag: "essential" }),
        tx({ type: "expense", amount: 400_000, category: "entertainment", description: "Hiburan", date: lastMonth(15), is_recurring: false, behavior_tag: "impulsive" }),
    ];
}

function seedModules(): EducationModule[] {
    const now = new Date().toISOString();
    const make = (
        order: number,
        slug: string,
        title: string,
        description: string,
        category: EducationModule["category"],
        estimated_time: number,
        content: string,
    ): EducationModule => ({
        id: uuid(),
        slug,
        title,
        description,
        content,
        category,
        estimated_time,
        order,
        created_at: now,
        updated_at: now,
    });

    return [
        make(1, "apa-itu-inflasi", "Apa Itu Inflasi", "Kenapa uang Rp 100.000 tahun lalu terasa lebih besar daripada sekarang.", "inflation", 4,
            "## Apa itu inflasi\n\nInflasi adalah kenaikan harga barang dan jasa secara umum dari waktu ke waktu.\n\nKalau harga naik 5% setahun, uang Rp 1.000.000 yang kamu diamkan hari ini hanya setara Rp 950.000 tahun depan."),
        make(2, "mulai-mencatat", "Mulai Mencatat Pengeluaran", "Langkah pertama yang paling membosankan, dan paling menentukan.", "budgeting", 3,
            "## Kenapa mencatat\n\nKamu tidak bisa memperbaiki apa yang tidak kamu ukur.\n\nCatat dulu selama dua minggu tanpa menghakimi diri sendiri. Polanya akan muncul sendiri."),
        make(3, "belanja-impulsif", "Mengenali Belanja Impulsif", "Kenapa kita membeli hal yang tidak direncanakan.", "behavioral", 5,
            "## Belanja impulsif\n\nBelanja impulsif jarang soal barangnya. Biasanya soal suasana hati.\n\nCoba aturan 24 jam: tunda pembelian tidak mendesak satu hari penuh."),
    ];
}

type DemoState = {
    transactions: Transaction[];
    modules: EducationModule[];
    profile: { id: string; email: string; name: string; settings: Record<string, unknown> };
};

function freshState(): DemoState {
    return {
        transactions: seedTransactions(),
        modules: seedModules(),
        profile: {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
            name: DEMO_USER.name,
            settings: {
                currency: "IDR",
                theme: "system",
                notifications_enabled: true,
                hide_balances: false,
            },
        },
    };
}

/*
 * Held on globalThis so the dataset survives Next's dev-server module reloads;
 * without this every hot reload would silently reset the demo mid-session.
 */
const globalForDemo = globalThis as unknown as { __bonkuDemo?: DemoState };

export function demoState(): DemoState {
    globalForDemo.__bonkuDemo ??= freshState();
    return globalForDemo.__bonkuDemo;
}

export function resetDemo(): void {
    globalForDemo.__bonkuDemo = freshState();
}

// ---------- transaction operations, mirroring the real routes

export function listTransactions(filters: {
    type?: string | null;
    category?: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
}): Transaction[] {
    return demoState()
        .transactions.filter((t) => {
            if (filters.type && t.type !== filters.type) return false;
            if (filters.category && t.category !== filters.category) return false;
            if (filters.dateFrom && t.date < filters.dateFrom) return false;
            if (filters.dateTo && t.date > filters.dateTo) return false;
            return true;
        })
        .sort((a, b) => b.date.localeCompare(a.date));
}

export function findTransaction(id: string): Transaction | undefined {
    return demoState().transactions.find((t) => t.id === id);
}

export function createTransaction(
    input: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at">,
): Transaction {
    const created = tx(input);
    demoState().transactions.unshift(created);
    return created;
}

export function updateTransaction(
    id: string,
    input: Partial<Transaction>,
): Transaction | undefined {
    const state = demoState();
    const index = state.transactions.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    state.transactions[index] = {
        ...state.transactions[index],
        ...input,
        id,
        user_id: DEMO_USER.id,
        updated_at: new Date().toISOString(),
    };

    return state.transactions[index];
}

export function deleteTransaction(id: string): Transaction | undefined {
    const state = demoState();
    const index = state.transactions.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    return state.transactions.splice(index, 1)[0];
}
