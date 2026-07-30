"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteTransaction } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils/currency";
import { Transaction } from "@/types/models";

export function TransactionActions({ transaction }: { transaction: Transaction }) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const deleteTransaction = useDeleteTransaction();

    const handleDelete = async () => {
        setError("");
        try {
            await deleteTransaction.mutateAsync(transaction.id);
            setOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menghapus transaksi");
        }
    };

    return (
        <>
            <div className="flex items-center gap-1">
                <Link
                    href={`/finance/${transaction.id}/edit`}
                    aria-label="Edit transaksi"
                >
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-600 hover:text-red-700"
                    aria-label="Hapus transaksi"
                    onClick={() => setOpen(true)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus transaksi ini?</DialogTitle>
                        <DialogDescription>
                            {transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}{" "}
                            sebesar {formatCurrency(transaction.amount)}
                            {transaction.description ? ` — ${transaction.description}` : ""}.
                            Tindakan ini tidak bisa dibatalkan.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <p role="alert" className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={deleteTransaction.isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteTransaction.isPending}
                        >
                            {deleteTransaction.isPending ? "Menghapus..." : "Hapus"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
