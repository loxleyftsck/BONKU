import {
    DollarSign,
    ShoppingBag,
    Car,
    Home,
    Heart,
    GraduationCap,
    Sparkles,
    TrendingUp,
    Utensils,
    Zap,
    type LucideIcon
} from 'lucide-react';

export type TransactionCategory = {
    id: string;
    label: string;
    icon: LucideIcon;
    color: string;
};

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
    {
        id: 'food',
        label: 'Makanan & Minuman',
        icon: Utensils,
        color: 'bg-orange-500',
    },
    {
        id: 'transportation',
        label: 'Transportasi',
        icon: Car,
        color: 'bg-blue-500',
    },
    {
        id: 'shopping',
        label: 'Belanja',
        icon: ShoppingBag,
        color: 'bg-pink-500',
    },
    {
        id: 'bills',
        label: 'Tagihan & Utilitas',
        icon: Zap,
        color: 'bg-purple-500',
    },
    {
        id: 'healthcare',
        label: 'Kesehatan',
        icon: Heart,
        color: 'bg-red-500',
    },
    {
        id: 'entertainment',
        label: 'Hiburan',
        icon: Sparkles,
        color: 'bg-yellow-500',
    },
    {
        id: 'education',
        label: 'Pendidikan',
        icon: GraduationCap,
        color: 'bg-green-500',
    },
    {
        id: 'housing',
        label: 'Perumahan',
        icon: Home,
        color: 'bg-indigo-500',
    },
] as const;

export const INCOME_CATEGORIES: TransactionCategory[] = [
    {
        id: 'salary',
        label: 'Gaji',
        icon: DollarSign,
        color: 'bg-emerald-500',
    },
    {
        id: 'freelance',
        label: 'Freelance',
        icon: TrendingUp,
        color: 'bg-teal-500',
    },
    {
        id: 'investment',
        label: 'Investasi',
        icon: TrendingUp,
        color: 'bg-indigo-500',
    },
    {
        id: 'gift',
        label: 'Hadiah/Bonus',
        icon: Sparkles,
        color: 'bg-rose-500',
    },
    {
        id: 'other',
        label: 'Lainnya',
        icon: DollarSign,
        color: 'bg-gray-500',
    },
] as const;

export function getCategoryById(id: string, type: 'income' | 'expense'): TransactionCategory | undefined {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return categories.find(cat => cat.id === id);
}
