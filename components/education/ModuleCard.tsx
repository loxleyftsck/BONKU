import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EducationModule } from "@/types/models";
import { Clock, BookOpen, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { educationCategory } from "@/config/education";

type ModuleCardProps = {
    module: EducationModule;
    progress?: {
        completed: boolean;
        time_spent: number;
    };
    onClick?: () => void;
};

export function ModuleCard({ module, progress, onClick }: ModuleCardProps) {

    const category = educationCategory(module.category);

    return (
        <Card
            className={cn(
                "cursor-pointer hover:bg-accent transition-colors relative",
                progress?.completed && "border-success"
            )}
            onClick={onClick}
        >
            {progress?.completed && (
                <div className="absolute top-2 right-2">
                    <Badge className="bg-success text-white gap-1">
                        <Check className="h-3 w-3" aria-hidden="true" />
                        Selesai
                    </Badge>
                </div>
            )}
            <CardHeader>
                <div className="flex items-start justify-between mb-2">
                    <Badge className={cn(category.className)}>
                        {category.label}
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
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        <span>{module.estimated_time} menit</span>
                    </div>
                    {progress && !progress.completed && progress.time_spent > 0 && (
                        <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" aria-hidden="true" />
                            <span>Dalam progress</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
