import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EducationModule } from "@/types/models";
import { Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ModuleCardProps = {
    module: EducationModule;
    progress?: {
        completed: boolean;
        time_spent: number;
    };
    onClick?: () => void;
};

export function ModuleCard({ module, progress, onClick }: ModuleCardProps) {
    const categoryColors = {
        inflation: "bg-orange-500",
        behavioral: "bg-purple-500",
        budgeting: "bg-blue-500",
        investing: "bg-green-500",
    };

    const categoryLabels = {
        inflation: "Inflasi",
        behavioral: "Behavioral Finance",
        budgeting: "Budgeting",
        investing: "Investasi",
    };

    return (
        <Card
            className={cn(
                "cursor-pointer hover:bg-accent transition-colors relative",
                progress?.completed && "border-green-500"
            )}
            onClick={onClick}
        >
            {progress?.completed && (
                <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500">✓ Selesai</Badge>
                </div>
            )}
            <CardHeader>
                <div className="flex items-start justify-between mb-2">
                    <Badge className={cn(categoryColors[module.category], "text-white")}>
                        {categoryLabels[module.category]}
                    </Badge>
                </div>
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                    {module.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{module.estimated_time} menit</span>
                    </div>
                    {progress && !progress.completed && progress.time_spent > 0 && (
                        <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>Dalam progress</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
