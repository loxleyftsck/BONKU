import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type StatCardProps = {
    title: string;
    /** ReactNode so callers can pass <Amount /> and honour hide-balances. */
    value: ReactNode;
    description?: string;
    icon?: LucideIcon;
    trend?: {
        /** null when there is no baseline to compare against. */
        value: number | null;
        /** Whether the movement is good news, which is not the same as "up". */
        isPositive: boolean;
    };
    className?: string;
};

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className
}: StatCardProps) {
    return (
        <Card className={cn("", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
                {trend &&
                    (trend.value === null ? (
                        <p className="text-xs mt-1 text-muted-foreground">
                            Belum ada pembanding
                        </p>
                    ) : trend.value === 0 ? (
                        <p className="text-xs mt-1 text-muted-foreground">
                            Sama seperti bulan lalu
                        </p>
                    ) : (
                        <p
                            className={cn(
                                "text-xs mt-1",
                                trend.isPositive ? "text-success" : "text-destructive"
                            )}
                        >
                            {/* Arrow reflects direction, colour reflects whether
                                that direction is good — rising expenses point up
                                but are not good news. */}
                            {trend.value > 0 ? "↑" : "↓"}{" "}
                            {Math.abs(trend.value).toFixed(1)}% dari bulan lalu
                        </p>
                    ))}
            </CardContent>
        </Card>
    );
}
