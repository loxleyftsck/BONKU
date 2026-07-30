import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
    /** What failed, in the user's terms. e.g. "transaksi" */
    subject: string;
    onRetry?: () => void;
};

/**
 * Shown when a query fails. Deliberately distinct from an empty state: telling
 * someone "no transactions yet" when the server is down reads as data loss.
 */
export function ErrorState({ subject, onRetry }: ErrorStateProps) {
    return (
        <div role="alert" className="border rounded-lg p-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-600 mb-3" />
            <p className="font-medium">Gagal memuat {subject}</p>
            <p className="text-sm text-muted-foreground mt-1">
                Datamu aman. Ini masalah koneksi atau server.
            </p>
            {onRetry && (
                <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
                    Coba Lagi
                </Button>
            )}
        </div>
    );
}
