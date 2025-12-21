"use client";

import { useEducationModule } from "@/hooks/useEducation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Check } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function ModuleDetailPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const resolvedParams = use(params);
    const { data: module, isLoading } = useEducationModule(resolvedParams.slug);

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Loading module...</p>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Modul tidak ditemukan</p>
                <Link href="/education">
                    <Button>Kembali ke Edukasi</Button>
                </Link>
            </div>
        );
    }

    const categoryLabels = {
        inflation: "Inflasi",
        behavioral: "Behavioral Finance",
        budgeting: "Budgeting",
        investing: "Investasi",
    };

    const categoryColors = {
        inflation: "bg-orange-500",
        behavioral: "bg-purple-500",
        budgeting: "bg-blue-500",
        investing: "bg-green-500",
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back Button */}
            <Link href="/education">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Edukasi
                </Button>
            </Link>

            {/* Module Header */}
            <Card>
                <CardHeader>
                    <div className="space-y-3">
                        <Badge className={`${categoryColors[module.category]} text-white w-fit`}>
                            {categoryLabels[module.category]}
                        </Badge>
                        <h1 className="text-3xl font-bold">{module.title}</h1>
                        {module.description && (
                            <p className="text-muted-foreground">{module.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{module.estimated_time} menit</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Module Content */}
            <Card>
                <CardContent className="pt-6">
                    <div
                        className="prose prose-neutral max-w-none"
                        dangerouslySetInnerHTML={{
                            __html: module.content
                                .replace(/^### /gm, '<h3 class="text-xl font-bold mt-6 mb-3">')
                                .replace(/^## /gm, '<h2 class="text-2xl font-bold mt-8 mb-4">')
                                .replace(/^# /gm, '<h1 class="text-3xl font-bold mt-10 mb-5">')
                                .replace(/\n\n/g, '</p><p class="mb-4">')
                                .replace(/^- /gm, '<li class="ml-6 list-disc">')
                                .replace(/^• /gm, '<li class="ml-6 list-disc">')
                                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                .replace(/```([\s\S]+?)```/g, '<pre class="bg-neutral-100 p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>')
                        }}
                    />
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between">
                <Button variant="outline">
                    ← Modul Sebelumnya
                </Button>
                <Button>
                    <Check className="h-4 w-4 mr-2" />
                    Tandai Selesai & Lanjut →
                </Button>
            </div>
        </div>
    );
}
