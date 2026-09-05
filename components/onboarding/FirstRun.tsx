import Link from "next/link";
import { PencilLine, Tags, LineChart, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";

const STEPS = [
    {
        icon: PencilLine,
        title: "Catat yang masuk dan keluar",
        body: "Setiap kali kamu terima atau keluarkan uang, catat di sini. Tidak perlu rapi — yang penting rutin.",
    },
    {
        icon: Tags,
        title: "Tandai yang tidak direncanakan",
        body: "Kalau sebuah pembelian tidak kamu rencanakan, tandai “Impulsif”. Nanti kamu bisa lihat berapa banyak uang yang habis ke situ.",
    },
    {
        icon: LineChart,
        title: "Lihat polanya sendiri",
        body: "Setelah sebulan, BONKU membandingkan bulan ini dengan bulan lalu dan menunjukkan apa yang berubah.",
    },
];

/**
 * Shown on the dashboard when the account has no transactions at all.
 *
 * The first-run state is derived from the data rather than a stored
 * "onboarding_completed" flag: an account with nothing recorded IS a new
 * account, and it disappears the moment something is recorded. No redirect, no
 * flag to get out of sync, and nothing for a returning user who cleared their
 * data to get stuck behind.
 *
 * It replaces a dashboard of zeroes. Reading "Rp 0" four times teaches the
 * target user — someone who has never used a budgeting app — nothing at all.
 */
export function FirstRun() {
    return (
        <Card>
            <CardContent className="p-6 sm:p-8 space-y-8">
                <div className="space-y-2">
                    <Logo className="text-2xl" />
                    <h2 className="text-xl font-bold">Belum ada apa-apa di sini</h2>
                    <p className="text-muted-foreground max-w-prose">
                        Wajar — kamu baru mulai. BONKU tidak terhubung ke bank dan
                        tidak menyimpan uangmu; semua angka datang dari apa yang
                        kamu catat sendiri.
                    </p>
                </div>

                <ol className="grid gap-6 sm:grid-cols-3">
                    {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <li key={step.title} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span
                                        aria-hidden="true"
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold"
                                    >
                                        {i + 1}
                                    </span>
                                    <Icon
                                        className="h-4 w-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                </div>
                                <p className="font-medium">{step.title}</p>
                                <p className="text-sm text-muted-foreground">{step.body}</p>
                            </li>
                        );
                    })}
                </ol>

                <div className="flex flex-wrap items-center gap-3">
                    <Link href="/finance/add">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                            Catat transaksi pertama
                        </Button>
                    </Link>
                    <Link href="/panduan">
                        <Button variant="outline">Baca panduan singkat</Button>
                    </Link>
                </div>

                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ShieldCheck
                        className="h-4 w-4 mt-px shrink-0"
                        aria-hidden="true"
                    />
                    Datamu hanya bisa dibaca olehmu. Kami tidak menjualnya dan tidak
                    menayangkan iklan.
                </p>
            </CardContent>
        </Card>
    );
}
