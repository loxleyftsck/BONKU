import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export default function LegalLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto p-6 space-y-8">
                <div className="flex items-center justify-between">
                    <Logo className="text-xl" />
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Kembali
                    </Link>
                </div>

                <article className="space-y-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
                    {children}
                </article>
            </div>
        </div>
    );
}
