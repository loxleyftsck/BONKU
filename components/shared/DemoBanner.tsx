import { FlaskConical } from "lucide-react";
import { isDemoMode } from "@/lib/demo/config";

/**
 * Standing notice that the figures on screen are fabricated.
 *
 * Non-negotiable in a finance app: a user must never be unsure whether the
 * numbers they are looking at are their own.
 */
export function DemoBanner() {
    if (!isDemoMode()) return null;

    return (
        <div
            role="status"
            className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm"
        >
            <FlaskConical
                className="h-4 w-4 mt-0.5 shrink-0 text-warning"
                aria-hidden="true"
            />
            <p>
                <strong>Mode tamu.</strong> Semua angka di sini adalah data contoh,
                bukan keuanganmu. Perubahan tersimpan sementara dan hilang saat
                server dijalankan ulang.
            </p>
        </div>
    );
}
