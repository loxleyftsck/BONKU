import { AIInsight } from "@/types/models";

export const MOCK_AI_INSIGHTS: AIInsight[] = [
    {
        id: "1",
        user_id: "user-1",
        type: "spending_alert",
        title: "Food Spending Meningkat 25%",
        message: `🍔 Food spending naik 25% dari bulan lalu.

Perbandingan:
- Bulan lalu: Rp 800.000
- Bulan ini: Rp 1.000.000

Kemungkinan penyebab:
• Frekuensi makan luar bertambah
• Harga bahan pokok naik (inflasi pangan 6.2%)
• Ada acara/event khusus

💡 Tips: Meal prep bisa save ~Rp 200-300k/bulan`,
        severity: "warning",
        actionable: true,
        actions: ["Lihat Detail Food", "Set Budget Food"],
        dismissed: false,
        created_at: new Date().toISOString(),
        expires_at: null,
    },
    {
        id: "2",
        user_id: "user-1",
        type: "behavior_pattern",
        title: "Impulse Buying Pattern Terdeteksi",
        message: `🛒 40% pengeluaranmu bulan ini adalah impulse purchase.

Total impulse: Rp 655.000
Kategori terbanyak: Shopping & Food

Waktu paling sering:
• Weekend malam (8 PM - 12 AM)
• Setelah kerja (6 PM - 8 PM)

💡 24-hour rule: Tunggu dulu sebelum beli barang >Rp 200k`,
        severity: "info",
        actionable: true,
        actions: ["Review Impulse Transactions", "Set Spending Limit"],
        dismissed: false,
        created_at: new Date().toISOString(),
        expires_at: null,
    },
    {
        id: "3",
        user_id: "user-1",
        type: "saving_opportunity",
        title: "Peluang Saving Rp 150k/bulan",
        message: `💰 Subscription review: Kamu punya 2 streaming services aktif.

• Netflix: Rp 75k/bulan
• Disney+: Rp 75k/bulan

Saran:
- Rotasi subscription tiap 2 bulan
- Family plan bareng teman (split cost)

Potensi saving: Rp 150k x 12 = Rp 1.8jt/tahun!`,
        severity: "info",
        actionable: true,
        actions: ["Cancel Subscription", "Ignore"],
        dismissed: false,
        created_at: new Date().toISOString(),
        expires_at: null,
    },
    {
        id: "4",
        user_id: "user-1",
        type: "inflation_impact",
        title: "Inflasi Pangan Lebih Tinggi dari Spending Kamu",
        message: `📈 Food spending naik 8% sementara inflasi pangan 6.2%.

Gap: +1.8%

Analisis:
✅ Kamu mengikuti trend inflasi (normal)
⚠️ Sedikit di atas rata-rata

Review:
• Apakah ada lifestyle change?
• Switch brand/toko untuk hemat?

Inflasi memang fakta, yang penting kamu aware dan adjust!`,
        severity: "info",
        actionable: false,
        actions: null,
        dismissed: false,
        created_at: new Date().toISOString(),
        expires_at: null,
    },
];

// Helper to get insights by type
export function getInsightsByType(
    type: AIInsight["type"]
): AIInsight[] {
    return MOCK_AI_INSIGHTS.filter((i) => i.type === type);
}

// Helper to get active insights (not dismissed)
export function getActiveInsights(): AIInsight[] {
    return MOCK_AI_INSIGHTS.filter((i) => !i.dismissed);
}
