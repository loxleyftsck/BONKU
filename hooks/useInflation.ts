import { useQuery } from "@tanstack/react-query";
import { InflationData } from "@/types/models";

export function useCurrentInflation() {
    return useQuery({
        queryKey: ["inflation-current"],
        queryFn: async () => {
            const res = await fetch("/api/inflation/current");
            if (!res.ok) throw new Error("Failed to fetch current inflation");
            const data = await res.json();
            return data.data as InflationData;
        },
    });
}

export function useHistoricalInflation(months: number = 6) {
    return useQuery({
        queryKey: ["inflation-historical", months],
        queryFn: async () => {
            const res = await fetch(`/api/inflation/historical?months=${months}`);
            if (!res.ok) throw new Error("Failed to fetch historical inflation");
            const data = await res.json();
            return data.data as InflationData[];
        },
    });
}
