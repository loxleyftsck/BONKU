"use client";

import { useAIInsights } from "@/hooks/useAI";
import { InsightCard } from "@/components/ai/InsightCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Lightbulb } from "lucide-react";
import type { AIInsight } from "@/types/models";
import { ErrorState } from "@/components/shared/ErrorState";

export default function InsightsPage() {
    const [typeFilter, setTypeFilter] = useState<string>("");
    const { data: insights, isLoading, isError, refetch } = useAIInsights(
        (typeFilter as AIInsight["type"]) || undefined,
        true
    );

    const types = [
        { value: "", label: "Semua" },
        { value: "spending_alert", label: "Spending Alert" },
        { value: "saving_opportunity", label: "Peluang Saving" },
        { value: "behavior_pattern", label: "Behavior Pattern" },
        { value: "inflation_impact", label: "Inflasi Impact" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
                <p className="text-muted-foreground mt-1">
                    Analisis dan rekomendasi personal untuk keuanganmu
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm text-muted-foreground">Total Insights</p>
                    </div>
                    <p className="text-2xl font-bold mt-2">{insights?.length || 0}</p>
                </div>
                <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Critical</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                        {insights?.filter(i => i.severity === "critical").length || 0}
                    </p>
                </div>
                <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Warning</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-2">
                        {insights?.filter(i => i.severity === "warning").length || 0}
                    </p>
                </div>
                <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Info</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                        {insights?.filter(i => i.severity === "info").length || 0}
                    </p>
                </div>
            </div>

            {/* Type Filter */}
            <div>
                <Tabs value={typeFilter} onValueChange={setTypeFilter}>
                    <TabsList>
                        {types.map((type) => (
                            <TabsTrigger key={type.value} value={type.value} className="text-xs">
                                {type.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Insights List */}
            <div>
                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Loading insights...
                    </div>
                ) : isError ? (
                    <ErrorState subject="insights" onRetry={() => refetch()} />
                ) : insights && insights.length > 0 ? (
                    <div className="space-y-4">
                        {insights.map((insight) => (
                            <InsightCard key={insight.id} insight={insight} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border rounded-lg">
                        <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">
                            Belum ada insights untuk kategori ini
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Terus catat transaksimu untuk mendapat insights personal!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
