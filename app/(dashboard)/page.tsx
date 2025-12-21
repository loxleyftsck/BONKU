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
import { formatCurrency } from "@/lib/utils/currency";

export default function DashboardPage() {
    // Fetch data from APIs
    const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
    const { data: transactions, isLoading: transactionsLoading } = useTransactions();
    const { data: insights, isLoading: insightsLoading } = useAIInsights(undefined, true);
    const { data: modules, isLoading: modulesLoading } = useEducationModules();

    // Get first 5 transactions
    const recentTransactions = transactions?.slice(0, 5) || [];

    // Get first education module
    const firstModule = modules?.[0];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Selamat datang kembali! Ini ringkasan keuanganmu bulan ini.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryLoading ? (
                    <div className="col-span-4 text-center py-8 text-muted-foreground">
                        Loading...
                    </div>
                ) : summary ? (
                    <>
                        <StatCard
                            title="Total Income"
                            value={formatCurrency(summary.total_income)}
                            icon={TrendingUp}
                            description="Bulan ini"
                            trend={{
                                value: summary.month_over_month.income_change,
                                isPositive: summary.month_over_month.income_change > 0
                            }}
                        />
                        <StatCard
                            title="Total Expenses"
                            value={formatCurrency(summary.total_expenses)}
                            icon={TrendingDown}
                            description="Bulan ini"
                            trend={{
                                value: summary.month_over_month.expense_change,
                                isPositive: summary.month_over_month.expense_change < 0
                            }}
                        />
                        <StatCard
                            title="Net Savings"
                            value={formatCurrency(summary.net_savings)}
                            icon={PiggyBank}
                            description="Bulan ini"
                            trend={{
                                value: summary.month_over_month.savings_change,
                                isPositive: summary.month_over_month.savings_change > 0
                            }}
                        />
                        <StatCard
                            title="Savings Rate"
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
                    <h2 className="text-2xl font-bold">💡 AI Insights</h2>
                    <Link href="/insights">
                        <Button variant="outline" size="sm">Lihat Semua</Button>
                    </Link>
                </div>

                {insightsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading insights...</div>
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
                        <h2 className="text-2xl font-bold">📊 Transaksi Terbaru</h2>
                        <Link href="/finance">
                            <Button variant="outline" size="sm">Lihat Semua</Button>
                        </Link>
                    </div>

                    {transactionsLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
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
                        <h2 className="text-2xl font-bold">📚 Lanjutkan Belajar</h2>
                        <Link href="/education">
                            <Button variant="outline" size="sm">Lihat Semua</Button>
                        </Link>
                    </div>

                    {modulesLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
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
