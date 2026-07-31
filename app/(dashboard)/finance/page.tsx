"use client";

import { useState } from "react";
import { useInfiniteTransactions } from "@/hooks/useTransactions";
import { TransactionCard } from "@/components/finance/TransactionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/config/categories";
import Link from "next/link";
import { Plus, Filter, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { Amount } from "@/components/shared/Amount";
import { HideBalancesToggle } from "@/components/shared/HideBalancesToggle";
import { StatCard } from "@/components/dashboard/StatCard";

export default function FinancePage() {
    const [filters, setFilters] = useState({
        type: "" as "" | "income" | "expense",
        category: "",
        dateFrom: "",
        dateTo: "",
    });

    const {
        data,
        isLoading,
        isError,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteTransactions(
        filters.type || filters.category || filters.dateFrom || filters.dateTo
            ? {
                type: filters.type || undefined,
                category: filters.category || undefined,
                date_from: filters.dateFrom || undefined,
                date_to: filters.dateTo || undefined,
            }
            : undefined
    );

    const transactions = data?.pages.flatMap((p) => p.data);
    const totalCount = data?.pages[0]?.total ?? 0;

    // NOTE: these total only the transactions LOADED SO FAR, which is why the
    // cards are labelled as such. A true all-time total needs a server-side
    // aggregate; see the dashboard summary endpoint.
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
                <div className="flex items-center gap-2">
                    <HideBalancesToggle />
                    <Link href="/finance/add">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                            Tambah Transaksi
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Summary Cards — these reflect the rows LOADED SO FAR under the
                active filter, not the all-time totals. */}
            {totals && (
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                        title="Pemasukan (yang dimuat)"
                        icon={TrendingUp}
                        value={
                            <Amount value={totals.income} className="text-success" />
                        }
                    />
                    <StatCard
                        title="Pengeluaran (yang dimuat)"
                        icon={TrendingDown}
                        value={
                            <Amount value={totals.expenses} className="text-destructive" />
                        }
                    />
                    <StatCard
                        title="Selisih (yang dimuat)"
                        icon={Wallet}
                        value={
                            <Amount
                                value={totals.income - totals.expenses}
                                className={
                                    totals.income - totals.expenses >= 0
                                        ? "text-success"
                                        : "text-destructive"
                                }
                            />
                        }
                    />
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
                        <label className="text-sm" htmlFor="filter-type">Tipe</label>
                        <select
                            id="filter-type"
                            className="w-full rounded-md border border-input bg-background px-3 min-h-11"
                            value={filters.type}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    type: e.target.value as "" | "income" | "expense",
                                })
                            }
                        >
                            <option value="">Semua</option>
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm" htmlFor="filter-category">Kategori</label>
                        <select
                            id="filter-category"
                            className="w-full rounded-md border border-input bg-background px-3 min-h-11"
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
                        <label className="text-sm" htmlFor="filter-date-from">Dari Tanggal</label>
                        <Input
                            id="filter-date-from"
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) =>
                                setFilters({ ...filters, dateFrom: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm" htmlFor="filter-date-to">Sampai Tanggal</label>
                        <Input
                            id="filter-date-to"
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
                    Semua Transaksi ({totalCount})
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

                        {hasNextPage && (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage
                                    ? "Memuat..."
                                    : `Muat lebih banyak (${transactions.length} dari ${totalCount})`}
                            </Button>
                        )}
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
