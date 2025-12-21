import { ReactNode } from "react";
import { Sidebar } from "@/components/shared/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-neutral-50">
            <Sidebar />
            <main className="lg:ml-64 min-h-screen">
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
