"use client";

import { useEducationModules } from "@/hooks/useEducation";
import { ModuleCard } from "@/components/education/ModuleCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { BookOpen, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { SkeletonList } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/shared/ErrorState";

export default function EducationPage() {
    const router = useRouter();
    const [category, setCategory] = useState<string>("");
    const { data: modules, isLoading, isError, refetch } = useEducationModules(category);

    const categories = [
        { value: "", label: "Semua" },
        { value: "inflation", label: "Inflasi" },
        { value: "behavioral", label: "Behavioral Finance" },
        { value: "budgeting", label: "Budgeting" },
        { value: "investing", label: "Investasi" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edukasi</h1>
                <p className="text-muted-foreground mt-1">
                    Microlearning modules untuk tingkatkan literasi finansialmu
                </p>
            </div>

            {/* Stats — only figures we can actually compute. A "Progress 0%"
                tile used to sit here permanently hardcoded, because nothing
                writes to user_progress yet. */}
            <div className="grid gap-4 md:grid-cols-2">
                <StatCard
                    title="Total Modul"
                    icon={BookOpen}
                    value={modules?.length ?? 0}
                />
                <StatCard
                    title="Estimasi Waktu"
                    icon={Clock}
                    value={`${modules?.reduce((sum, m) => sum + m.estimated_time, 0) ?? 0} menit`}
                    description="Untuk menyelesaikan semua modul"
                />
            </div>

            {/* Category Filter */}
            <div>
                <Tabs value={category} onValueChange={setCategory}>
                    <TabsList>
                        {categories.map((cat) => (
                            <TabsTrigger key={cat.value} value={cat.value}>
                                {cat.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Modules List */}
            <div>
                {isLoading ? (
                    <SkeletonList count={6} />
                ) : isError ? (
                    <ErrorState subject="modul edukasi" onRetry={() => refetch()} />
                ) : modules && modules.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {modules.map((module) => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                onClick={() => router.push(`/education/${module.slug}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border rounded-lg">
                        <p className="text-muted-foreground">
                            Tidak ada modul untuk kategori ini
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
