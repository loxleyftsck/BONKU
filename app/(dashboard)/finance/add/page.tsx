"use client";

import { TransactionForm } from "@/components/finance/TransactionForm";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AddTransactionPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push("/finance");
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Back Button */}
            <Link href="/finance">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Keuangan
                </Button>
            </Link>

            {/* Form */}
            <TransactionForm onSuccess={handleSuccess} />
        </div>
    );
}
