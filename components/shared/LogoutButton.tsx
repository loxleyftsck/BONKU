"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isDemoMode } from "@/lib/demo/config";

export function LogoutButton() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogout = async () => {
        setLoading(true);
        setError("");

        try {
            // Demo mode has no session to sign out of.
            if (!isDemoMode()) {
                const res = await fetch("/api/auth/logout", { method: "POST" });

                if (!res.ok) {
                    throw new Error("Gagal keluar. Coba lagi.");
                }
            }

            // Drop every cached response so the next account cannot read the
            // previous user's financial data out of the query cache.
            queryClient.clear();

            router.push("/login");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal keluar.");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive/80"
                onClick={handleLogout}
                disabled={loading}
            >
                <LogOut className="h-4 w-4 mr-2" />
                {loading ? "Keluar..." : "Logout"}
            </Button>
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
