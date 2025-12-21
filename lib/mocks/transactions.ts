import { Transaction } from "@/types/models";

export const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: "1",
        user_id: "user-1",
        type: "income",
        amount: 4800000,
        category: "salary",
        description: "Gaji Bulanan Desember",
        date: "2024-12-01",
        is_recurring: true,
        behavior_tag: null,
        created_at: "2024-12-01T00:00:00Z",
        updated_at: "2024-12-01T00:00:00Z",
    },
    {
        id: "2",
        user_id: "user-1",
        type: "expense",
        amount: 150000,
        category: "food",
        description: "Belanja groceries Indomaret",
        date: "2024-12-15",
        is_recurring: false,
        behavior_tag: "planned",
        created_at: "2024-12-15T10:30:00Z",
        updated_at: "2024-12-15T10:30:00Z",
    },
    {
        id: "3",
        user_id: "user-1",
        type: "expense",
        amount: 85000,
        category: "food",
        description: "Makan siang sama teman",
        date: "2024-12-16",
        is_recurring: false,
        behavior_tag: "impulsive",
        created_at: "2024-12-16T14:00:00Z",
        updated_at: "2024-12-16T14:00:00Z",
    },
    {
        id: "4",
        user_id: "user-1",
        type: "expense",
        amount: 50000,
        category: "transportation",
        description: "Grab ke kantor",
        date: "2024-12-17",
        is_recurring: false,
        behavior_tag: "essential",
        created_at: "2024-12-17T07:30:00Z",
        updated_at: "2024-12-17T07:30:00Z",
    },
    {
        id: "5",
        user_id: "user-1",
        type: "expense",
        amount: 350000,
        category: "shopping",
        description: "Beli sepatu baru",
        date: "2024-12-18",
        is_recurring: false,
        behavior_tag: "impulsive",
        created_at: "2024-12-18T20:15:00Z",
        updated_at: "2024-12-18T20:15:00Z",
    },
    {
        id: "6",
        user_id: "user-1",
        type: "expense",
        amount: 200000,
        category: "bills",
        description: "Listrik bulan Desember",
        date: "2024-12-10",
        is_recurring: true,
        behavior_tag: "essential",
        created_at: "2024-12-10T09:00:00Z",
        updated_at: "2024-12-10T09:00:00Z",
    },
    {
        id: "7",
        user_id: "user-1",
        type: "income",
        amount: 500000,
        category: "freelance",
        description: "Project web development",
        date: "2024-12-12",
        is_recurring: false,
        behavior_tag: null,
        created_at: "2024-12-12T16:00:00Z",
        updated_at: "2024-12-12T16:00:00Z",
    },
    {
        id: "8",
        user_id: "user-1",
        type: "expense",
        amount: 75000,
        category: "entertainment",
        description: "Netflix subscription",
        date: "2024-12-05",
        is_recurring: true,
        behavior_tag: "planned",
        created_at: "2024-12-05T00:00:00Z",
        updated_at: "2024-12-05T00:00:00Z",
    },
    {
        id: "9",
        user_id: "user-1",
        type: "expense",
        amount: 120000,
        category: "food",
        description: "Kopi & snack",
        date: "2024-12-19",
        is_recurring: false,
        behavior_tag: "impulsive",
        created_at: "2024-12-19T15:30:00Z",
        updated_at: "2024-12-19T15:30:00Z",
    },
    {
        id: "10",
        user_id: "user-1",
        type: "expense",
        amount: 300000,
        category: "healthcare",
        description: "Check-up dokter gigi",
        date: "2024-12-14",
        is_recurring: false,
        behavior_tag: "essential",
        created_at: "2024-12-14T11:00:00Z",
        updated_at: "2024-12-14T11:00:00Z",
    },
];

// Helper function to get transactions by date range
export function getTransactionsByDateRange(
    transactions: Transaction[],
    startDate: string,
    endDate: string
): Transaction[] {
    return transactions.filter((t) => {
        const tDate = new Date(t.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return tDate >= start && tDate <= end;
    });
}

// Helper function to get transactions by type
export function getTransactionsByType(
    transactions: Transaction[],
    type: "income" | "expense"
): Transaction[] {
    return transactions.filter((t) => t.type === type);
}

// Helper function to calculate totals
export function calculateTotals(transactions: Transaction[]) {
    const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        income,
        expenses,
        savings: income - expenses,
        savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
    };
}
