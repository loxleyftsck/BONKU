// Database models matching Supabase schema

export type User = {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    wallet_address: string | null;
    settings: {
        currency: 'IDR';
        theme: 'light' | 'dark' | 'system';
        notifications_enabled: boolean;
    };
    created_at: string;
    updated_at: string;
};

export type Transaction = {
    id: string;
    user_id: string;
    type: 'income' | 'expense';
    amount: number; // in IDR
    category: string;
    description: string | null;
    date: string; // ISO 8601 date string
    is_recurring: boolean;
    behavior_tag: 'planned' | 'impulsive' | 'essential' | null;
    created_at: string;
    updated_at: string;
};

export type EducationModule = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    content: string; // Markdown content
    category: 'inflation' | 'behavioral' | 'budgeting' | 'investing';
    estimated_time: number; // in minutes
    order: number;
    created_at: string;
    updated_at: string;
};

export type UserProgress = {
    id: string;
    user_id: string;
    module_id: string;
    completed: boolean;
    time_spent: number; // in seconds
    last_accessed: string | null;
    created_at: string;
    updated_at: string;
};

export type AIInsight = {
    id: string;
    user_id: string;
    type: 'spending_alert' | 'saving_opportunity' | 'inflation_impact' | 'behavior_pattern';
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    actionable: boolean;
    actions: string[] | null;
    dismissed: boolean;
    created_at: string;
    expires_at: string | null;
};

export type InflationData = {
    id: string;
    month: string; // YYYY-MM
    overall_rate: number;
    food: number | null;
    transportation: number | null;
    housing: number | null;
    healthcare: number | null;
    education: number | null;
    source: string;
    created_at: string;
};

// Category spending summary
export type CategorySummary = {
    category: string;
    amount: number;
    percentage: number;
    count: number;
};

// Monthly summary
export type MonthlySummary = {
    total_income: number;
    total_expenses: number;
    net_savings: number;
    savings_rate: number;
    top_categories: CategorySummary[];
    month_over_month: {
        income_change: number;
        expense_change: number;
        savings_change: number;
    };
};
