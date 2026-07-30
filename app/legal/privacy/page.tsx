import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kebijakan Privasi",
};

export default function PrivacyPage() {
    return (
        <>
            <h1 className="text-3xl font-bold tracking-tight">Kebijakan Privasi</h1>

            <div
                role="note"
                className="border border-warning/40 bg-warning/10 rounded-lg p-4 text-sm"
            >
                <strong>Draf.</strong> Dokumen ini menjelaskan secara faktual data
                apa yang benar-benar disimpan aplikasi saat ini. Dokumen ini belum
                ditinjau penasihat hukum dan belum memenuhi kewajiban formal
                UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi. Tinjau
                sebelum rilis publik.
            </div>

            <h2>Data yang kami simpan</h2>
            <p>
                BONKU menyimpan hal-hal berikut, dan tidak lebih dari itu:
            </p>
            <ul>
                <li>Alamat email dan nama yang kamu masukkan saat mendaftar.</li>
                <li>
                    Transaksi yang kamu catat sendiri: nominal, kategori, tanggal,
                    deskripsi opsional, dan penanda perilaku opsional.
                </li>
                <li>Preferensi tampilan, seperti mata uang dan tema.</li>
            </ul>

            <h2>Yang tidak kami lakukan</h2>
            <ul>
                <li>
                    Kami tidak terhubung ke rekening bank, kartu, atau dompet digital
                    mana pun. Semua data dimasukkan manual olehmu.
                </li>
                <li>Kami tidak menjual atau membagikan datamu ke pihak ketiga.</li>
                <li>Kami tidak menayangkan iklan berdasarkan datamu.</li>
            </ul>

            <h2>Di mana data disimpan</h2>
            <p>
                Data disimpan di Supabase (PostgreSQL). Akses dibatasi di tingkat
                basis data sehingga satu akun hanya bisa membaca barisnya sendiri.
            </p>

            <h2>Hak kamu</h2>
            <p>
                Kamu bisa mengubah atau menghapus setiap transaksi kapan saja lewat
                halaman Keuangan. Untuk menghapus seluruh akun beserta datanya,
                hubungi kami di alamat di bawah.
            </p>

            <h2>Kontak</h2>
            <p>
                Pertanyaan soal data: <em>[alamat email dukungan belum ditetapkan]</em>
            </p>
        </>
    );
}
