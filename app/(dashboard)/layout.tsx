import { ReactNode } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { DemoBanner } from "@/components/shared/DemoBanner";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-muted/40">
            <Sidebar />
            <main id="main-content" className="lg:ml-64 min-h-screen">
                <div className="p-6 lg:p-8 space-y-6">
                    <DemoBanner />
                    {children}
                </div>
            </main>
        </div>
    );
}
