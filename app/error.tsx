"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
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
        <div className="min-h-screen flex items-center justify-center p-6">
            <div role="alert" className="max-w-md text-center space-y-4">
                <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
                <h1 className="text-2xl font-bold">Terjadi kesalahan</h1>
                <p className="text-muted-foreground">
                    Kami tidak bisa memuat halaman ini. Datamu aman — coba muat
                    ulang sebentar lagi.
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground">
                        Kode error: {error.digest}
                    </p>
                )}
                <Button onClick={reset}>Coba Lagi</Button>
            </div>
        </div>
    );
}
