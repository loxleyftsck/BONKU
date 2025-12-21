import { useQuery } from "@tanstack/react-query";
import { EducationModule } from "@/types/models";

export function useEducationModules(category?: string) {
    return useQuery({
        queryKey: ["education-modules", category],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (category) searchParams.set("category", category);

            const res = await fetch(`/api/education/modules?${searchParams}`);
            if (!res.ok) throw new Error("Failed to fetch education modules");
            const data = await res.json();
            return data.data as EducationModule[];
        },
    });
}

export function useEducationModule(slug: string) {
    return useQuery({
        queryKey: ["education-module", slug],
        queryFn: async () => {
            const res = await fetch(`/api/education/modules?slug=${slug}`);
            if (!res.ok) throw new Error("Failed to fetch education module");
            const data = await res.json();
            return data.data as EducationModule;
        },
        enabled: !!slug,
    });
}
