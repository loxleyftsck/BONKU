"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionFormData } from "@/lib/utils/validators";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/config/categories";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TransactionFormProps = {
    onSuccess?: () => void;
    defaultValues?: Partial<TransactionFormData>;
    /** When present the form edits this transaction instead of creating one. */
    transactionId?: string;
};

export function TransactionForm({
    onSuccess,
    defaultValues,
    transactionId,
}: TransactionFormProps) {
    const isEditing = Boolean(transactionId);

    const [transactionType, setTransactionType] = useState<"income" | "expense">(
        defaultValues?.type || "expense"
    );

    const createTransaction = useCreateTransaction();
    const updateTransaction = useUpdateTransaction();
    const mutation = isEditing ? updateTransaction : createTransaction;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: "expense",
            date: new Date().toISOString().split("T")[0],
            is_recurring: false,
            ...defaultValues,
        },
    });

    const [submitError, setSubmitError] = useState("");

    const onSubmit = async (data: TransactionFormData) => {
        setSubmitError("");
        try {
            if (transactionId) {
                await updateTransaction.mutateAsync({ id: transactionId, ...data });
            } else {
                await createTransaction.mutateAsync(data);
                reset();
            }
            onSuccess?.();
        } catch (error) {
            // Previously console.error only — the form appeared to hang.
            setSubmitError(
                error instanceof Error ? error.message : "Gagal menyimpan transaksi"
            );
        }
    };

    const categories = transactionType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isEditing ? "Edit Transaksi" : "Tambah Transaksi"}
                </CardTitle>
                <CardDescription>
                    {isEditing
                        ? "Perbaiki detail transaksi ini"
                        : "Catat pemasukan atau pengeluaranmu untuk tracking yang lebih baik"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {submitError && (
                        <div
                            role="alert"
                            className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive"
                        >
                            {submitError}
                        </div>
                    )}

                    {/* Type Selector */}
                    <div className="space-y-2">
                        <Label>Tipe Transaksi</Label>
                        <Tabs
                            value={transactionType}
                            onValueChange={(value) => {
                                const newType = value as "income" | "expense";
                                setTransactionType(newType);
                                setValue("type", newType);
                            }}
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                                <TabsTrigger value="income">Pemasukan</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <input type="hidden" {...register("type")} />
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">
                            Jumlah <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                Rp
                            </span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="150000"
                                className="pl-10"
                                {...register("amount", { valueAsNumber: true })}
                            />
                        </div>
                        {errors.amount && (
                            <p className="text-sm text-destructive">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">
                            Kategori <span className="text-destructive">*</span>
                        </Label>
                        <NativeSelect
                            id="category"
                            {...register("category")}
                        >
                            <option value="">Pilih kategori...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.label}
                                </option>
                            ))}
                        </NativeSelect>
                        {errors.category && (
                            <p className="text-sm text-destructive">{errors.category.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi (opsional)</Label>
                        <Input
                            id="description"
                            placeholder="Contoh: Belanja groceries Indomaret"
                            {...register("description")}
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date">
                            Tanggal <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            {...register("date")}
                        />
                        {errors.date && (
                            <p className="text-sm text-destructive">{errors.date.message}</p>
                        )}
                    </div>

                    {/* Behavior Tag (only for expenses) */}
                    {transactionType === "expense" && (
                        <div className="space-y-2">
                            <Label htmlFor="behavior_tag">Jenis pengeluaran (opsional)</Label>
                            <NativeSelect
                                id="behavior_tag"
                                {...register("behavior_tag")}
                            >
                                <option value="">Tidak ada</option>
                                <option value="planned">Terencana</option>
                                <option value="impulsive">Impulsif</option>
                                <option value="essential">Penting</option>
                            </NativeSelect>
                            <p className="text-xs text-muted-foreground">
                                Tandai kalau pembelian ini tidak kamu rencanakan.
                                Nanti kamu bisa lihat berapa uang yang habis ke situ.
                            </p>
                        </div>
                    )}

                    {/* Recurring */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="is_recurring"
                            className="rounded border-input"
                            {...register("is_recurring")}
                        />
                        <Label htmlFor="is_recurring" className="font-normal cursor-pointer">
                            Transaksi berulang (bulanan)
                        </Label>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending
                            ? "Menyimpan..."
                            : isEditing
                              ? "Simpan Perubahan"
                              : "Simpan Transaksi"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
