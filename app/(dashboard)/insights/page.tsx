"use client";

import { useAIInsights } from "@/hooks/useAI";
import { InsightCard } from "@/components/ai/InsightCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Lightbulb, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { SkeletonList } from "@/components/ui/skeleton";
import type { AIInsight } from "@/types/models";
import { ErrorState } from "@/components/shared/ErrorState";

export default function InsightsPage() {
    const [typeFilter, setTypeFilter] = useState<string>("");
    const { data: insights, isLoading, isError, refetch } = useAIInsights(
        (typeFilter as AIInsight["type"]) || undefined,
        true
    );

    const counts = {
        total: insights?.length ?? 0,
        critical: insights?.filter((i) => i.severity === "critical").length ?? 0,
        warning: insights?.filter((i) => i.severity === "warning").length ?? 0,
        info: insights?.filter((i) => i.severity === "info").length ?? 0,
    };

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
                <StatCard title="Total" icon={Lightbulb} value={counts.total} />
                <StatCard
                    title="Penting"
                    icon={AlertCircle}
                    value={
                        <span className="text-destructive">{counts.critical}</span>
                    }
                />
                <StatCard
                    title="Perlu perhatian"
                    icon={AlertTriangle}
                    value={<span className="text-warning">{counts.warning}</span>}
                />
                <StatCard
                    title="Info"
                    icon={Info}
                    value={<span className="text-brand">{counts.info}</span>}
                />
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
                    <SkeletonList count={3} />
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
                        <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
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
