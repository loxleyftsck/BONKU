"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { InsightCard } from "@/components/ai/InsightCard";
import { TransactionCard } from "@/components/finance/TransactionCard";
import { ModuleCard } from "@/components/education/ModuleCard";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDashboardSummary } from "@/hooks/useDashboard";
import { useTransactions } from "@/hooks/useTransactions";
import { useAIInsights } from "@/hooks/useAI";
import { useEducationModules } from "@/hooks/useEducation";
import { Amount } from "@/components/shared/Amount";
import { HideBalancesToggle } from "@/components/shared/HideBalancesToggle";
import { ErrorState } from "@/components/shared/ErrorState";
import { SkeletonList, SkeletonStats } from "@/components/ui/skeleton";

export default function DashboardPage() {
    // Fetch data from APIs
    const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = useDashboardSummary();
    const { data: transactions, isLoading: transactionsLoading, isError: transactionsError, refetch: refetchTransactions } = useTransactions({ per_page: 5 });
    const { data: insights, isLoading: insightsLoading, isError: insightsError, refetch: refetchInsights } = useAIInsights(undefined, true);
    const { data: modules, isLoading: modulesLoading, isError: modulesError, refetch: refetchModules } = useEducationModules();

    // Get first 5 transactions
    const recentTransactions = transactions?.slice(0, 5) || [];

    // Get first education module
    const firstModule = modules?.[0];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Selamat datang kembali! Ini ringkasan keuanganmu bulan ini.
                    </p>
                </div>
                <HideBalancesToggle />
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryLoading ? (
                    <SkeletonStats count={4} />
                ) : summaryError ? (
                    <div className="col-span-4">
                        <ErrorState subject="ringkasan keuangan" onRetry={() => refetchSummary()} />
                    </div>
                ) : summary ? (
                    <>
                        <StatCard
                            title="Total Pemasukan"
                            value={<Amount value={summary.total_income} />}
                            icon={TrendingUp}
                            description="Bulan ini"
                            trend={{
                                value: summary.month_over_month.income_change,
                                // More income is good.
                                isPositive:
                                    (summary.month_over_month.income_change ?? 0) > 0,
                            }}
                        />
                        <StatCard
                            title="Total Pengeluaran"
                            value={<Amount value={summary.total_expenses} />}
                            icon={TrendingDown}
                            description="Bulan ini"
                            trend={{
                                value: summary.month_over_month.expense_change,
                                // Less spending is good, so a fall is positive.
                                isPositive:
                                    (summary.month_over_month.expense_change ?? 0) < 0,
                            }}
                        />
                        <StatCard
                            title="Sisa Bersih"
                            value={<Amount value={summary.net_savings} />}
                            icon={PiggyBank}
                            description="Bulan ini"
                            trend={{
                                value: summary.month_over_month.savings_change,
                                isPositive:
                                    (summary.month_over_month.savings_change ?? 0) > 0,
                            }}
                        />
                        <StatCard
                            title="Rasio Menabung"
                            value={`${summary.savings_rate.toFixed(1)}%`}
                            icon={Wallet}
                            description="Target: 30%"
                        />
                    </>
                ) : null}
            </div>

            {/* AI Insights */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Insights</h2>
                    <Link href="/insights">
                        <Button variant="outline" size="sm">Lihat Semua</Button>
                    </Link>
                </div>

                {insightsLoading ? (
                    <SkeletonList count={2} />
                ) : insightsError ? (
                    <ErrorState subject="insights" onRetry={() => refetchInsights()} />
                ) : insights && insights.length > 0 ? (
                    <div className="space-y-4">
                        {insights.slice(0, 2).map((insight) => (
                            <InsightCard key={insight.id} insight={insight} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No insights available yet. Keep tracking your transactions!
                    </div>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Recent Transactions */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Transaksi Terbaru</h2>
                        <Link href="/finance">
                            <Button variant="outline" size="sm">Lihat Semua</Button>
                        </Link>
                    </div>

                    {transactionsLoading ? (
                        <SkeletonList count={5} />
                    ) : transactionsError ? (
                        <ErrorState subject="transaksi" onRetry={() => refetchTransactions()} />
                    ) : recentTransactions.length > 0 ? (
                        <div className="space-y-3">
                            {recentTransactions.map((transaction) => (
                                <TransactionCard key={transaction.id} transaction={transaction} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No transactions yet. Start by adding your first transaction!
                        </div>
                    )}
                </div>

                {/* Continue Learning */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Lanjutkan Belajar</h2>
                        <Link href="/education">
                            <Button variant="outline" size="sm">Lihat Semua</Button>
                        </Link>
                    </div>

                    {modulesLoading ? (
                        <SkeletonList count={1} />
                    ) : modulesError ? (
                        <ErrorState subject="modul edukasi" onRetry={() => refetchModules()} />
                    ) : firstModule ? (
                        <ModuleCard module={firstModule} />
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No education modules available.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
