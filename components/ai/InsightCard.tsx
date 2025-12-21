import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIInsight } from "@/types/models";
import { AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type InsightCardProps = {
    insight: AIInsight;
    onDismiss?: (id: string) => void;
    onAction?: (action: string) => void;
};

export function InsightCard({ insight, onDismiss, onAction }: InsightCardProps) {
    const severityConfig = {
        info: {
            icon: Info,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
        },
        warning: {
            icon: AlertTriangle,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
        },
        critical: {
            icon: AlertCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
        },
    };

    const config = severityConfig[insight.severity];
    const Icon = config.icon;

    return (
        <Card className={cn("relative", config.borderColor, config.bgColor)}>
            {onDismiss && (
                <button
                    onClick={() => onDismiss(insight.id)}
                    className="absolute top-2 right-2 p-1 hover:bg-white/50 rounded-full transition-colors">
                    <X className="h-4 w-4 text-muted-foreground" />
                </button>
            )}

            <CardHeader>
                <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg", config.color)}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base">{insight.title}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                                {insight.type === "spending_alert" && "💸 Alert"}
                                {insight.type === "saving_opportunity" && "💰 Peluang"}
                                {insight.type === "inflation_impact" && "📈 Inflasi"}
                                {insight.type === "behavior_pattern" && "🔍 Pattern"}
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
