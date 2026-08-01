import { ReactNode } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { BottomNav } from "@/components/shared/BottomNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-muted/40">
            <Sidebar />
            <main id="main-content" className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
                <div className="p-6 lg:p-8 space-y-6">
                    <DemoBanner />
                    {children}
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
