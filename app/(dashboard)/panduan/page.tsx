import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Panduan Singkat",
};

/**
 * The fuller explanation, for someone who wants it before starting.
 *
 * Written for a reader who has never used a budgeting app: no jargon left
 * untranslated, and the honest limits stated rather than glossed over.
 */
export default function PanduanPage() {
    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Panduan Singkat</h1>
                <p className="text-muted-foreground mt-1">
                    Lima menit untuk paham cara pakainya
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Apa yang BONKU lakukan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                    <p>
                        BONKU mencatat uang yang masuk dan keluar, lalu
                        merangkumnya jadi angka yang bisa kamu baca. Itu saja —
                        dan itu sudah cukup untuk mengubah kebiasaan.
                    </p>
                    <p className="text-foreground font-medium">
                        Yang tidak dilakukan BONKU:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Tidak terhubung ke rekening bank, kartu, atau e-wallet.</li>
                        <li>Tidak menyimpan atau memindahkan uangmu.</li>
                        <li>
                            Tidak memberi nasihat investasi. Ringkasan di sini
                            adalah hitungan atas datamu, bukan rekomendasi keuangan.
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mencatat transaksi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                    <p>
                        Setiap catatan butuh tiga hal: <strong className="text-foreground">jumlah</strong>,{" "}
                        <strong className="text-foreground">kategori</strong>, dan{" "}
                        <strong className="text-foreground">tanggal</strong>. Deskripsi
                        opsional, tapi membantu saat kamu melihatnya lagi bulan depan.
                    </p>
                    <p>
                        Salah catat tidak masalah — setiap transaksi bisa diubah atau
                        dihapus lewat halaman Keuangan.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tiga penanda kebiasaan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                    <p>
                        Saat mencatat pengeluaran, kamu bisa menandainya. Ini opsional,
                        tapi inilah yang membuat ringkasannya jadi berguna.
                    </p>
                    <dl className="space-y-3">
                        <div>
                            <dt className="text-foreground font-medium">Terencana</dt>
                            <dd>Sudah kamu niatkan sebelumnya — belanja bulanan, bayar kos.</dd>
                        </div>
                        <div>
                            <dt className="text-foreground font-medium">Impulsif</dt>
                            <dd>
                                Tidak direncanakan. Muncul karena diskon, lapar, atau
                                sedang ingin saja.
                            </dd>
                        </div>
                        <div>
                            <dt className="text-foreground font-medium">Penting</dt>
                            <dd>Harus dibayar apa pun yang terjadi — obat, transportasi kerja.</dd>
                        </div>
                    </dl>
                    <p>
                        Kalau kamu menandai sebagian besar pengeluaran, BONKU bisa
                        memberitahu berapa persen uangmu habis ke pembelian impulsif.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Kapan angkanya mulai berguna</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                    <p>
                        Ringkasan dan grafik butuh pembanding. Sebelum ada dua bulan
                        data, BONKU sengaja tidak menampilkan tren — lebih baik diam
                        daripada menunjukkan angka yang menyesatkan.
                    </p>
                    <p>
                        Catat selama dua minggu tanpa menghakimi diri sendiri dulu.
                        Polanya akan muncul sendiri.
                    </p>
                </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
                <Link href="/finance/add">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                        Mulai catat
                    </Button>
                </Link>
                <Link href="/education">
                    <Button variant="outline">Lihat modul edukasi</Button>
                </Link>
            </div>
        </div>
    );
}
