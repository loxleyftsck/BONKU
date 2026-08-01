"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Wallet,
    BookOpen,
    Lightbulb,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const items = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Keuangan", href: "/finance", icon: Wallet },
    { name: "Edukasi", href: "/education", icon: BookOpen },
    { name: "Insights", href: "/insights", icon: Lightbulb },
    { name: "Pengaturan", href: "/settings", icon: Settings },
];

/**
 * Primary navigation on phones.
 *
 * A hamburger was the only way to move between sections, which buries every
 * destination behind a tap and a decision. A tab bar puts them under the
 * thumb, which is the expectation for a mobile-first audience.
 *
 * pb-[env(safe-area-inset-bottom)] keeps the row clear of the iPhone home
 * indicator and the Android gesture bar.
 */
export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Navigasi utama"
            className={cn(
                "lg:hidden fixed bottom-0 inset-x-0 z-40",
                "border-t bg-card/95 backdrop-blur",
                "pb-[env(safe-area-inset-bottom)]",
            )}
        >
            <ul className="grid grid-cols-5">
                {items.map((item) => {
                    const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    // min-h-14 keeps the whole tap area well past 44px.
                                    "flex flex-col items-center justify-center gap-1 min-h-14 px-1",
                                    "text-[11px] font-medium transition-colors",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                <Icon className="h-5 w-5" aria-hidden="true" />
                                <span className="truncate">{item.name}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
