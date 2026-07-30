import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Syarat & Ketentuan",
};

export default function TermsPage() {
    return (
        <>
            <h1 className="text-3xl font-bold tracking-tight">Syarat &amp; Ketentuan</h1>

            <div
                role="note"
                className="border border-warning/40 bg-warning/10 rounded-lg p-4 text-sm"
            >
                <strong>Draf.</strong> Dokumen ini belum ditinjau penasihat hukum.
                Tinjau sebelum rilis publik.
            </div>

            <h2>Apa itu BONKU</h2>
            <p>
                BONKU adalah aplikasi pencatatan keuangan pribadi. Kamu mencatat
                pemasukan dan pengeluaranmu sendiri, lalu aplikasi merangkumnya.
            </p>

            <h2>BONKU bukan lembaga keuangan</h2>
            <ul>
                <li>
                    BONKU tidak menyimpan, memindahkan, atau mengelola uangmu. Tidak
                    ada saldo sungguhan di dalam aplikasi ini — hanya catatan yang
                    kamu tulis sendiri.
                </li>
                <li>
                    BONKU tidak terhubung ke bank, kartu, atau dompet digital.
                </li>
                <li>
                    Ringkasan dan materi edukasi di dalam aplikasi bersifat informasi
                    umum, bukan nasihat keuangan atau investasi.
                </li>
            </ul>

            <h2>Tanggung jawabmu</h2>
            <p>
                Ketepatan angka bergantung pada apa yang kamu masukkan. Jaga
                kerahasiaan kata sandimu, dan keluar dari akun bila memakai
                perangkat bersama.
            </p>

            <h2>Perubahan</h2>
            <p>
                Ketentuan ini dapat berubah. Perubahan penting akan diberitahukan di
                dalam aplikasi.
            </p>
        </>
    );
}
