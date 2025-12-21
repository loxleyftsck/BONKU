import { EducationModule } from "@/types/models";

export const MOCK_EDUCATION_MODULES: EducationModule[] = [
    {
        id: "1",
        title: "Apa itu Inflasi?",
        slug: "apa-itu-inflasi",
        description: "Pelajari dasar-dasar inflasi dan bagaimana mempengaruhi daya beli uangmu",
        content: `# Apa itu Inflasi?

## Definisi Sederhana

Inflasi adalah **kenaikan harga barang dan jasa secara umum** dalam jangka waktu tertentu. 

Contoh simpel:
- Tahun lalu: Nasi goreng Rp 15.000
- Tahun ini: Nasi goreng Rp 18.000
- **Inflasi:** 20%

## Mengapa Inflasi Penting?

### 1. Daya Beli Menurun
Uang Rp 100.000 hari ini **tidak sama** dengan Rp 100.000 tahun depan.

Jika inflasi 5% per tahun:
- Tahun ini: Rp 100.000 = 6.6 kg beras
- Tahun depan: Rp 100.000 = 6.3 kg beras

### 2. Tabungan Tergerus
Kalau kamu hanya menabung di celengan, nilai uangmu **berkurang** karena inflasi.

💡 **Solusi:** Investasi dengan return > inflasi

## Inflasi di Indonesia 2024

Rata-rata: **2.5-3% per tahun**

Tapi kategori berbeda:
- 🍔 Makanan: 5-7% (paling tinggi!)
- 🚗 Transportasi: 1-2%
- 🏠 Perumahan: 2-3%

## Aksi yang Bisa Kamu Lakukan

1. **Track spending by category** → Lihat mana yang naik drastis
2. **Adjust budget** → Alokasikan lebih untuk kategori high-inflation
3. **Invest, don't just save** → Minimal deposito (4-5% per tahun)

---

💡 **Remember:** Inflasi adalah fakta ekonomi. Yang penting kamu **aware** dan **adapt**!
`,
        category: "inflation",
        estimated_time: 5,
        order: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
    },
    {
        id: "2",
        title: "Inflasi vs Daya Beli",
        slug: "inflasi-vs-daya-beli",
        description: "Memahami hubungan antara inflasi dan kemampuan membeli barang & jasa",
        content: `# Inflasi vs Daya Beli

## Real Value vs Nominal Value

**Nominal:** Angka yang tertulis  
**Real:** Nilai sebenarnya setelah disesuaikan inflasi

Contoh:
- Gaji naik 10% (nominal)
- Inflasi 8%
- Kenaikan **real** = 2% saja!

## Mengukur Daya Beli

Formula sederhana:
\`\`\`
Real Income = Nominal Income / (1 + Inflasi)
\`\`\`

Contoh:
- Gaji: Rp 5.000.000
- Inflasi: 3%
- Real income: Rp 4.854.369

**Kehilangan:** Rp 145.631 per bulan!

## Tips Melawan Inflasi

1. Negosiasi kenaikan gaji > inflasi
2. Side hustle untuk income tambahan
3. Invest in assets (saham, reksadana)
4. Efisiensi spending di kategori high-inflation
`,
        category: "inflation",
        estimated_time: 4,
        order: 2,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
    },
    {
        id: "3",
        title: "Bias Kognitif dalam Keputusan Finansial",
        slug: "bias-kognitif-finansial",
        description: "7 bias psikologis yang sering membuat kamu salah kelola uang",
        content: `# Bias Kognitif dalam Keputusan Finansial

## 1. Present Bias
**Definisi:** Lebih suka reward sekarang vs masa depan

**Contoh:**
- Beli gadget baru Rp 5jt sekarang
- vs Invest Rp 5jt → Rp 8jt dalam 3 tahun
- Kebanyakan pilih: Beli sekarang!

**Fix:** 24-hour rule untuk pembelian >Rp 500k

## 2. Anchoring Effect
**Definisi:** Terlalu fokus pada informasi pertama

**Contoh:**
- Harga coret: ~~Rp 500.000~~
- Harga diskon: Rp 300.000
- Kamu merasa "untung Rp 200k" padahal barang worth Rp 250k saja

**Fix:** Riset harga di 3 toko sebelum beli

## 3. Loss Aversion
**Definisi:** Takut rugi > senang untung

**Contoh:**
- Investasi turun 10% → langsung jual (panic)
- Padahal long-term masih bagus

**Fix:** Set target jangka panjang, ignore daily noise

## 4. Confirmation Bias
**Definisi:** Cari info yang confirm belief kamu

**Contoh:**
- Mau beli iPhone → cari review positive
- Ignore review negative

**Fix:** Aktif cari counter-arguments

## Action Plan

✅ Pause sebelum keputusan finansial besar  
✅ Tulis pros & cons  
✅ Tanya teman yang objektif  
✅ Track emotions saat beli impulsive
`,
        category: "behavioral",
        estimated_time: 6,
        order: 3,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
    },
    {
        id: "4",
        title: "50/30/20 Rule",
        slug: "50-30-20-rule",
        description: "Framework budgeting paling simpel dan efektif untuk pemula",
        content: `# 50/30/20 Rule

## Konsep

Bagi income jadi 3 kategori:

### 50% - Needs (Kebutuhan)
- Sewa/KPR
- Listrik, air, internet
- Groceries, transportasi
- Asuransi

### 30% - Wants (Keinginan)
- Makan luar
- Nonton, hobi
- Shopping non-essential
- Liburan

### 20% - Savings & Investments
- Emergency fund
- Investasi (reksadana, saham)
- Pelunasan utang

## Contoh Perhitungan

Income: Rp 5.000.000

- Needs: Rp 2.500.000
- Wants: Rp 1.500.000
- Savings: Rp 1.000.000

## Implementasi

1. Hitung income bersih (after tax)
2. Set up auto-debet 20% ke tabungan
3. Track needs & wants monthly
4. Adjust kalau perlu

💡 **Tip:** Kalau needs >50%, cari cara cut costs atau increase income
`,
        category: "budgeting",
        estimated_time: 3,
        order: 4,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
    },
    {
        id: "5",
        title: "Emergency Fund Essentials",
        slug: "emergency-fund-essentials",
        description: "Mengapa perlu, berapa besar, dan bagaimana cara membangunnya",
        content: `# Emergency Fund Essentials

## Apa itu Emergency Fund?

Uang yang disisihkan untuk **keadaan darurat**:
- Kehilangan pekerjaan
- Sakit mendadak
- Kerusakan kendaraan/rumah
- Kebutuhan urgent lainnya

## Berapa yang Dibutuhkan?

### Formula Standar:
**3-6 bulan pengeluaran bulanan**

Contoh:
- Monthly expenses: Rp 3.000.000
- Emergency fund: Rp 9.000.000 - 18.000.000

### Adjust Based on:
- Single vs Married: Single cukup 3 bulan
- Job stability: Freelance butuh 6+ bulan
- Dependents: Ada anak → butuh lebih besar

## Cara Membangun

### Step-by-step:
1. **Target mini:** Rp 2jt dulu (1 bulan expenses)
2. **Auto-save:** 10-15% dari gaji
3. **Taruh di:** Deposito/tabungan high-interest
4. **Don't touch** kecuali emergency beneran

### Tips Cepat:
- Set up auto-debet hari gajian
- Bonus/THR → langsung masuk emergency fund
- Side hustle income → prioritas emergency fund

## Kapan Boleh Dipakai?

✅ Kehilangan pekerjaan  
✅ Medical emergency  
✅ Kerusakan rumah/kendaraan urgent  

❌ Liburan  
❌ Beli gadget baru  
❌ Sale besar-besaran

---

💡 Emergency fund = peace of mind!
`,
        category: "budgeting",
        estimated_time: 4,
        order: 5,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
    },
];

// Helper to get modules by category
export function getModulesByCategory(
    category: "inflation" | "behavioral" | "budgeting" | "investing"
): EducationModule[] {
    return MOCK_EDUCATION_MODULES.filter((m) => m.category === category);
}

// Helper to get module by slug
export function getModuleBySlug(slug: string): EducationModule | undefined {
    return MOCK_EDUCATION_MODULES.find((m) => m.slug === slug);
}
