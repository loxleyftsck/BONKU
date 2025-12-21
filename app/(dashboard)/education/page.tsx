"use client";

import { useEducationModules } from "@/hooks/useEducation";
import { ModuleCard } from "@/components/education/ModuleCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { BookOpen } from "lucide-react";

export default function EducationPage() {
    const [category, setCategory] = useState<string>("");
    const { data: modules, isLoading } = useEducationModules(category);

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

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <p className="text-sm text-muted-foreground">Total Modul</p>
                    </div>
                    <p className="text-2xl font-bold mt-2">{modules?.length || 0}</p>
                </div>
                <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Estimasi Waktu Total</p>
                    <p className="text-2xl font-bold mt-2">
                        {modules?.reduce((sum, m) => sum + m.estimated_time, 0) || 0} menit
                    </p>
                </div>
                <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold mt-2">0%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        0 dari {modules?.length || 0} selesai
                    </p>
                </div>
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
                    <div className="text-center py-12 text-muted-foreground">
                        Loading modules...
                    </div>
                ) : modules && modules.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {modules.map((module) => (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                onClick={() => window.location.href = `/education/${module.slug}`}
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
