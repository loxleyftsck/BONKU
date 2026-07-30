"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div role="alert" className="border rounded-lg p-8 text-center space-y-4">
            <AlertCircle className="h-10 w-10 mx-auto text-red-600" />
            <div>
                <h2 className="text-xl font-bold">Gagal memuat halaman</h2>
                <p className="text-muted-foreground mt-1">
                    Ini masalah di sisi kami, bukan datamu. Coba lagi sebentar lagi.
                </p>
            </div>
            <Button onClick={reset}>Coba Lagi</Button>
        </div>
    );
}
