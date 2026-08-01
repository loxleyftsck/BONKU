import { WifiOff } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export const metadata = { title: "Sedang offline" };

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-sm text-center space-y-4">
                <Logo className="text-2xl" />
                <WifiOff
                    className="h-12 w-12 mx-auto text-muted-foreground"
                    aria-hidden="true"
                />
                <h1 className="text-2xl font-bold">Kamu sedang offline</h1>
                <p className="text-muted-foreground">
                    Halaman ini belum pernah dibuka, jadi belum tersimpan. Catatan
                    yang sudah pernah kamu lihat tetap bisa dibuka tanpa sinyal.
                </p>
                <p className="text-sm text-muted-foreground">
                    Untuk menambah atau mengubah transaksi, kamu perlu koneksi.
                </p>
            </div>
        </div>
    );
}
