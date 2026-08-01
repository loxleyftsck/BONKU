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
import { Logo } from "@/components/shared/Logo";
import { useProfile } from "@/hooks/useProfile";


const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Keuangan", href: "/finance", icon: Wallet },
    { name: "Edukasi", href: "/education", icon: BookOpen },
    { name: "Insights", href: "/insights", icon: Lightbulb },
    { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: profile } = useProfile();

    const displayName = profile?.name || profile?.email?.split("@")[0] || "—";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <>
            {/* Sidebar — desktop only; phones use BottomNav */}
            <aside
                id="main-navigation"
                className="hidden lg:block fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r"
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b">
                        <Logo className="text-xl" withTagline />
                    </div>

                    {/* Navigation */}
                    <nav aria-label="Navigasi utama" className="flex-1 p-4 space-y-1">
                        {navigation.map((item) => {
                            // Prefix match so /finance/add still highlights "Keuangan".
                            const isActive =
                                pathname === item.href ||
                                pathname.startsWith(`${item.href}/`);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    aria-current={isActive ? "page" : undefined}
                                    className={cn(
                                        // min-h-11 ≈ 44px, the minimum comfortable touch target.
                                        "flex items-center gap-3 px-3 min-h-11 rounded-lg transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-accent text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info */}
                    <div className="p-4 border-t">
                        <div className="flex items-center gap-3">
                            <div
                                aria-hidden="true"
                                className="h-10 w-10 shrink-0 bg-linear-to-br from-brand to-brand-accent rounded-lg flex items-center justify-center text-white font-bold"
                            >
                                {initial}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{displayName}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {profile?.email ?? ""}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
