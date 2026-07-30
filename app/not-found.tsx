import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md text-center space-y-4">
                <Compass className="h-12 w-12 mx-auto text-muted-foreground" />
                <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
                <p className="text-muted-foreground">
                    Halaman yang kamu cari sudah dipindahkan atau tidak pernah ada.
                </p>
                <Link href="/dashboard">
                    <Button>Kembali ke Dashboard</Button>
                </Link>
            </div>
        </div>
    );
}
