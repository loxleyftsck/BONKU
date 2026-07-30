"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { ErrorState } from "@/components/shared/ErrorState";
import { useTransaction } from "@/hooks/useTransactions";

export default function EditTransactionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: transaction, isLoading, isError, refetch } = useTransaction(id);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link href="/finance">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Keuangan
                </Button>
            </Link>

            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                    Loading transaksi...
                </div>
            ) : isError ? (
                <ErrorState subject="transaksi" onRetry={() => refetch()} />
            ) : transaction ? (
                <TransactionForm
                    transactionId={transaction.id}
                    defaultValues={{
                        type: transaction.type,
                        amount: transaction.amount,
                        category: transaction.category,
                        description: transaction.description ?? undefined,
                        date: transaction.date,
                        behavior_tag: transaction.behavior_tag ?? undefined,
                        is_recurring: transaction.is_recurring,
                    }}
                    onSuccess={() => router.push("/finance")}
                />
            ) : null}
        </div>
    );
}
