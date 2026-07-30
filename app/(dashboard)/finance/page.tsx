"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionCard } from "@/components/finance/TransactionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/config/categories";
import Link from "next/link";
import { Plus, Filter } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { formatCurrency } from "@/lib/utils/currency";

export default function FinancePage() {
    const [filters, setFilters] = useState({
        type: "" as "" | "income" | "expense",
        category: "",
        dateFrom: "",
        dateTo: "",
    });

    const { data: transactions, isLoading, isError, refetch } = useTransactions(
        filters.type || filters.category || filters.dateFrom || filters.dateTo
            ? {
                type: filters.type || undefined,
                category: filters.category || undefined,
                date_from: filters.dateFrom || undefined,
                date_to: filters.dateTo || undefined,
            }
            : undefined
    );

    // Calculate totals
    const totals = transactions?.reduce(
        (acc, t) => {
            if (t.type === "income") {
                acc.income += t.amount;
            } else {
                acc.expenses += t.amount;
            }
            return acc;
        },
        { income: 0, expenses: 0 }
    );

    const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Keuangan</h1>
                    <p className="text-muted-foreground mt-1">
                        Kelola dan tracking semua transaksi keuanganmu
                    </p>
                </div>
                <Link href="/finance/add">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Transaksi
                    </Button>
                </Link>
            </div>

            {/* Summary Cards */}
            {totals && (
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Pemasukan</p>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(totals.income)}
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                        <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(totals.expenses)}
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Net</p>
                        <p className={`text-2xl font-bold ${totals.income - totals.expenses >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                            {formatCurrency(totals.income - totals.expenses)}
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5" />
                    <h2 className="font-semibold">Filter Transaksi</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                        <label className="text-sm">Tipe</label>
                        <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                            value={filters.type}
                            onChange={(e) =>
                                setFilters({ ...filters, type: e.target.value as any })
                            }
                        >
                            <option value="">Semua</option>
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm">Kategori</label>
                        <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2"
                            value={filters.category}
                            onChange={(e) =>
                                setFilters({ ...filters, category: e.target.value })
                            }
                        >
                            <option value="">Semua</option>
                            {allCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm">Dari Tanggal</label>
                        <Input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) =>
                                setFilters({ ...filters, dateFrom: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm">Sampai Tanggal</label>
                        <Input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) =>
                                setFilters({ ...filters, dateTo: e.target.value })
                            }
                        />
                    </div>
                </div>

                {(filters.type || filters.category || filters.dateFrom || filters.dateTo) && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() =>
                            setFilters({ type: "", category: "", dateFrom: "", dateTo: "" })
                        }
                    >
                        Reset Filter
                    </Button>
                )}
            </div>

            {/* Transactions List */}
            <div>
                <h2 className="text-xl font-bold mb-4">
                    Semua Transaksi ({transactions?.length || 0})
                </h2>

                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Loading transaksi...
                    </div>
                ) : isError ? (
                    <ErrorState subject="transaksi" onRetry={() => refetch()} />
                ) : transactions && transactions.length > 0 ? (
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <TransactionCard
                                key={transaction.id}
                                transaction={transaction}
                                showActions
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border rounded-lg">
                        <p className="text-muted-foreground mb-4">
                            Belum ada transaksi yang sesuai dengan filter
                        </p>
                        <Link href="/finance/add">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Transaksi Pertama
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
