import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type ProfileSettings = {
    currency?: "IDR";
    theme?: "light" | "dark" | "system";
    notifications_enabled?: boolean;
    /** Blur monetary amounts on shared or public screens. */
    hide_balances?: boolean;
};

export type Profile = {
    id: string;
    email: string;
    name: string | null;
    settings: ProfileSettings | null;
};

export function useProfile() {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const res = await fetch("/api/profile");
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error || "Gagal memuat profil");
            }
            const body = await res.json();
            return body.data as Profile;
        },
        // The signed-in user's own name/email rarely changes mid-session.
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (update: {
            name?: string;
            settings?: ProfileSettings;
        }) => {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(update),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.error || "Gagal memperbarui profil");
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },
    });
}
