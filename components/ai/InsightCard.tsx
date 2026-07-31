import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIInsight } from "@/types/models";
import { AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TYPE_LABELS: Record<AIInsight["type"], string> = {
    spending_alert: "Peringatan belanja",
    saving_opportunity: "Peluang hemat",
    inflation_impact: "Dampak inflasi",
    behavior_pattern: "Pola kebiasaan",
};

type InsightCardProps = {
    insight: AIInsight;
    onDismiss?: (id: string) => void;
    onAction?: (action: string) => void;
};

export function InsightCard({ insight, onDismiss, onAction }: InsightCardProps) {
    // Severity maps onto the theme's semantic tokens, so these surfaces follow
    // light/dark and any future palette change instead of pinning raw Tailwind
    // shades that only work on a white background.
    const severityConfig = {
        info: {
            icon: Info,
            color: "text-brand",
            bgColor: "bg-brand/5",
            borderColor: "border-brand/20",
            label: "Info",
        },
        warning: {
            icon: AlertTriangle,
            color: "text-warning",
            bgColor: "bg-warning/5",
            borderColor: "border-warning/20",
            label: "Perlu perhatian",
        },
        critical: {
            icon: AlertCircle,
            color: "text-destructive",
            bgColor: "bg-destructive/5",
            borderColor: "border-destructive/20",
            label: "Penting",
        },
    };

    const config = severityConfig[insight.severity];
    const Icon = config.icon;

    return (
        <Card className={cn("relative", config.borderColor, config.bgColor)}>
            {onDismiss && (
                <button
                    type="button"
                    aria-label="Tutup insight ini"
                    onClick={() => onDismiss(insight.id)}
                    className="absolute top-2 right-2 p-2 hover:bg-accent rounded-full transition-colors"
                >
                    <X className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </button>
            )}

            <CardHeader>
                <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", config.color)}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">{config.label}</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base">{insight.title}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                                {TYPE_LABELS[insight.type]}
                            </Badge>
                        </div>
                        <CardDescription className="whitespace-pre-line text-sm">
                            {insight.message}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            {insight.actionable && insight.actions && insight.actions.length > 0 && (
                <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                        {insight.actions.map((action, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => onAction?.(action)}
                                className="text-xs"
                            >
                                {action}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
