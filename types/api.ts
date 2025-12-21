// API Request/Response types

// Transactions
export type CreateTransactionRequest = {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description?: string;
    date: string;
    behavior_tag?: 'planned' | 'impulsive' | 'essential';
    is_recurring?: boolean;
};

export type UpdateTransactionRequest = Partial<CreateTransactionRequest>;

export type TransactionListParams = {
    date_from?: string;
    date_to?: string;
    category?: string;
    type?: 'income' | 'expense';
    page?: number;
    per_page?: number;
};

// Dashboard
export type DashboardSummaryParams = {
    month?: string; // YYYY-MM format
};

// AI Insights
export type GenerateInsightsRequest = {
    force_refresh?: boolean;
};

// Education
export type UpdateProgressRequest = {
    module_id: string;
    completed?: boolean;
    time_spent?: number;
};

// API Response wrapper
export type ApiResponse<T> = {
    data: T;
    error: null;
} | {
    data: null;
    error: {
        message: string;
        code?: string;
    };
};
