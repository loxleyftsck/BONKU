-- BONKU v5.1 - Seed Data
-- Run this AFTER 001_initial_schema.sql

-- =====================================================
-- 1. SEED EDUCATION MODULES (5 modules)
-- =====================================================
INSERT INTO public.education_modules (title, slug, description, content, category, estimated_time, "order") VALUES
('Apa itu Inflasi?', 'apa-itu-inflasi', 'Pelajari dasar-dasar inflasi dan bagaimana mempengaruhi daya beli uangmu', 
'# Apa itu Inflasi?

## Definisi Sederhana
Inflasi adalah **kenaikan harga barang dan jasa secara umum** dalam jangka waktu tertentu.

Contoh simpel:
- Tahun lalu: Nasi goreng Rp 15.000
- Tahun ini: Nasi goreng Rp 18.000
- **Inflasi:** 20%

## Mengapa Inflasi Penting?

### 1. Daya Beli Menurun
Uang Rp 100.000 hari ini **tidak sama** dengan Rp 100.000 tahun depan.

### 2. Tabungan Tergerus
Kalau kamu hanya menabung di celengan, nilai uangmu **berkurang** karena inflasi.

💡 **Solusi:** Investasi dengan return > inflasi', 
'inflation', 5, 1),

('Inflasi vs Daya Beli', 'inflasi-vs-daya-beli', 'Memahami hubungan antara inflasi dan kemampuan membeli barang & jasa',
'# Inflasi vs Daya Beli

## Real Value vs Nominal Value
**Nominal:** Angka yang tertulis  
**Real:** Nilai sebenarnya setelah disesuaikan inflasi

Contoh:
- Gaji naik 10% (nominal)
- Inflasi 8%
- Kenaikan **real** = 2% saja!',
'inflation', 4, 2),

('Bias Kognitif dalam Keputusan Finansial', 'bias-kognitif-finansial', '7 bias psikologis yang sering membuat kamu salah kelola uang',
'# Bias Kognitif dalam Keputusan Finansial

## 1. Present Bias
**Definisi:** Lebih suka reward sekarang vs masa depan

**Fix:** 24-hour rule untuk pembelian >Rp 500k

## 2. Anchoring Effect
**Fix:** Riset harga di 3 toko sebelum beli',
'behavioral', 6, 3),

('50/30/20 Rule', '50-30-20-rule', 'Framework budgeting paling simpel dan efektif untuk pemula',
'# 50/30/20 Rule

## Konsep
Bagi income jadi 3 kategori:

### 50% - Needs (Kebutuhan)
- Sewa/KPR, Listrik, Groceries

### 30% - Wants (Keinginan)
- Makan luar, Nonton, Shopping

### 20% - Savings & Investments
- Emergency fund, Investasi',
'budgeting', 3, 4),

('Emergency Fund Essentials', 'emergency-fund-essentials', 'Mengapa perlu, berapa besar, dan bagaimana cara membangunnya',
'# Emergency Fund Essentials

## Apa itu Emergency Fund?
Uang yang disisihkan untuk **keadaan darurat**

## Berapa yang Dibutuhkan?
**3-6 bulan pengeluaran bulanan**

## Cara Membangun
1. Target mini: Rp 2jt dulu
2. Auto-save: 10-15% dari gaji
3. Taruh di: Deposito/tabungan high-interest',
'budgeting', 4, 5);

-- =====================================================
-- 2. SEED INFLATION DATA (6 months)
-- =====================================================
INSERT INTO public.inflation_data (month, overall_rate, food, transportation, housing, healthcare, education, source) VALUES
('2024-12', 2.78, 6.24, 1.52, 2.15, 3.42, 2.89, 'BPS'),
('2024-11', 2.56, 5.87, 1.34, 2.01, 3.21, 2.76, 'BPS'),
('2024-10', 2.45, 5.32, 1.28, 1.95, 3.15, 2.68, 'BPS'),
('2024-09', 2.12, 4.89, 1.15, 1.87, 2.98, 2.54, 'BPS'),
('2024-08', 2.03, 4.56, 1.08, 1.79, 2.87, 2.45, 'BPS'),
('2024-07', 1.95, 4.21, 0.98, 1.72, 2.76, 2.38, 'BPS');

-- =====================================================
-- DONE! Seed data inserted
-- =====================================================
