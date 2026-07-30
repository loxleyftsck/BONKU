"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";

export function HideBalancesToggle() {
    const { data: profile } = useProfile();
    const updateProfile = useUpdateProfile();

    const hidden = profile?.settings?.hide_balances ?? false;

    return (
        <Button
            variant="outline"
            size="sm"
            aria-pressed={hidden}
            disabled={!profile || updateProfile.isPending}
            onClick={() =>
                updateProfile.mutate({ settings: { hide_balances: !hidden } })
            }
        >
            {hidden ? (
                <EyeOff className="h-4 w-4 mr-2" aria-hidden="true" />
            ) : (
                <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
            )}
            {hidden ? "Tampilkan nominal" : "Sembunyikan nominal"}
        </Button>
    );
}
