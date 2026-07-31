import type { EducationModule } from "@/types/models";

type Category = EducationModule["category"];

/**
 * Single source of truth for how education categories are labelled and
 * coloured. The map was previously duplicated in ModuleCard and the module
 * detail page, so the two could drift apart.
 *
 * Chart tokens rather than raw Tailwind shades, so the categories stay
 * distinguishable in dark mode.
 */
export const EDUCATION_CATEGORIES: Record<
    Category,
    { label: string; className: string }
> = {
    inflation: { label: "Inflasi", className: "bg-chart-1 text-white" },
    behavioral: { label: "Behavioral Finance", className: "bg-chart-4 text-white" },
    budgeting: { label: "Budgeting", className: "bg-chart-2 text-white" },
    investing: { label: "Investasi", className: "bg-chart-3 text-white" },
};

export function educationCategory(category: Category) {
    return EDUCATION_CATEGORIES[category];
}
