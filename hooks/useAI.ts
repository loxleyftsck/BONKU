import { useQuery } from "@tanstack/react-query";
import { AIInsight } from "@/types/models";

export function useAIInsights(type?: AIInsight["type"], activeOnly: boolean = true) {
    return useQuery({
        queryKey: ["ai-insights", type, activeOnly],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (type) searchParams.set("type", type);
            if (activeOnly) searchParams.set("active_only", "true");

            const res = await fetch(`/api/ai/insights?${searchParams}`);
            if (!res.ok) throw new Error("Failed to fetch AI insights");
            const data = await res.json();
            return data.data as AIInsight[];
        },
    });
}
