"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Constructed inside the effect: createClient() throws when the Supabase
    // env vars are absent, and calling it during render breaks prerendering
    // at build time.
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.refresh();
      } else if (event === "SIGNED_OUT") {
        // Drop cached financial data so it cannot leak into the next session.
        queryClient.clear();
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, queryClient]);

  return <>{children}</>;
}
