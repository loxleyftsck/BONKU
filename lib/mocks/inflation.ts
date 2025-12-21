import { InflationData } from "@/types/models";

export const MOCK_INFLATION_DATA: InflationData[] = [
    {
        id: "1",
        month: "2024-12",
        overall_rate: 2.78,
        food: 6.24,
        transportation: 1.52,
        housing: 2.15,
        healthcare: 3.42,
        education: 2.89,
        source: "BPS",
        created_at: "2024-12-01T00:00:00Z",
    },
    {
        id: "2",
        month: "2024-11",
        overall_rate: 2.56,
        food: 5.87,
        transportation: 1.34,
        housing: 2.01,
        healthcare: 3.21,
        education: 2.76,
        source: "BPS",
        created_at: "2024-11-01T00:00:00Z",
    },
    {
        id: "3",
        month: "2024-10",
        overall_rate: 2.45,
        food: 5.32,
        transportation: 1.28,
        housing: 1.95,
        healthcare: 3.15,
        education: 2.68,
        source: "BPS",
        created_at: "2024-10-01T00:00:00Z",
    },
    {
        id: "4",
        month: "2024-09",
        overall_rate: 2.12,
        food: 4.89,
        transportation: 1.15,
        housing: 1.87,
        healthcare: 2.98,
        education: 2.54,
        source: "BPS",
        created_at: "2024-09-01T00:00:00Z",
    },
    {
        id: "5",
        month: "2024-08",
        overall_rate: 2.03,
        food: 4.56,
        transportation: 1.08,
        housing: 1.79,
        healthcare: 2.87,
        education: 2.45,
        source: "BPS",
        created_at: "2024-08-01T00:00:00Z",
    },
    {
        id: "6",
        month: "2024-07",
        overall_rate: 1.95,
        food: 4.21,
        transportation: 0.98,
        housing: 1.72,
        healthcare: 2.76,
        education: 2.38,
        source: "BPS",
        created_at: "2024-07-01T00:00:00Z",
    },
];

// Helper to get current month inflation
export function getCurrentInflation(): InflationData {
    return MOCK_INFLATION_DATA[0]; // Most recent
}

// Helper to get inflation by month
export function getInflationByMonth(month: string): InflationData | undefined {
    return MOCK_INFLATION_DATA.find((data) => data.month === month);
}

// Helper to get inflation trend (last N months)
export function getInflationTrend(months: number = 6): InflationData[] {
    return MOCK_INFLATION_DATA.slice(0, months);
}
