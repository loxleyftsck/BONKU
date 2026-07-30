import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/models";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { getCategoryById } from "@/config/categories";
import { cn } from "@/lib/utils/cn";
import { TransactionActions } from "@/components/finance/TransactionActions";

type TransactionCardProps = {
    transaction: Transaction;
    onClick?: () => void;
    /** Render edit/delete controls. Off by default for compact summary lists. */
    showActions?: boolean;
};

export function TransactionCard({
    transaction,
    onClick,
    showActions = false,
}: TransactionCardProps) {
    const category = getCategoryById(transaction.category, transaction.type);
    const Icon = category?.icon;

    return (
        <Card
            // Only signal interactivity when the card is actually interactive —
            // it previously rendered cursor-pointer with no handler attached.
            className={cn(
                "transition-colors",
                onClick && "cursor-pointer hover:bg-accent"
            )}
            onClick={onClick}
        >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-start gap-3">
                    {Icon && (
                        <div className={cn(
                            "p-2 rounded-lg",
                            category?.color,
                            "text-white"
                        )}>
                            <Icon className="h-4 w-4" />
                        </div>
                    )}
                    <div>
                        <CardTitle className="text-base">
                            {transaction.description || category?.label || transaction.category}
                        </CardTitle>
                        <CardDescription>
                            {format(new Date(transaction.date), "dd MMM yyyy", { locale: idLocale })}
                        </CardDescription>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <div className="text-right">
                        <div className={cn(
                            "text-lg font-bold",
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                        )}>
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                        </div>
                        {transaction.behavior_tag && (
                            <Badge variant="outline" className="mt-1 text-xs">
                                {transaction.behavior_tag === "planned" && "📋 Terencana"}
                                {transaction.behavior_tag === "impulsive" && "⚡ Impulsif"}
                                {transaction.behavior_tag === "essential" && "⭐ Penting"}
                            </Badge>
                        )}
                    </div>
                    {showActions && <TransactionActions transaction={transaction} />}
                </div>
            </CardHeader>
        </Card>
    );
}
