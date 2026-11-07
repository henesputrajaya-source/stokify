import { useState } from "react";
import type { FormEvent } from "react";
import { Check, Trash2 } from "lucide-react";
import { useSettings } from "../context/useSettings";
import { useBarang } from "../context/useBarang";
import { useTransaksi } from "../context/useTransaksi";
import { useConfirm } from "../context/useConfirm";
import type { Pengaturan as PengaturanData } from "../context/SettingsContext";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:ring-violet-500/20";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300";
const kartuClass =
  "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800";

const ROLE = ["Admin", "Staf Gudang", "Kasir"];

export default function Pengaturan() {
  const { pengaturan, simpan, reset: resetPengaturan } = useSettings();
  const { reset: resetBarang } = useBarang();
  const { reset: resetTransaksi } = useTransaksi();
  const konfirmasi = useConfirm();

  // draft form; angka disimpan sebagai teks supaya input bisa dikosongkan saat mengetik
  const [namaUser, setNamaUser] = useState(pengaturan.namaUser);
  const [role, setRole] = useState(pengaturan.role);
  const [namaToko, setNamaToko] = useState(pengaturan.namaToko);
  const [batas, setBatas] = useState(String(pengaturan.batasMenipis));
  const [error, setError] = useState("");
  const [tersimpan, setTersimpan] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const angka = Number(batas);
    if (!namaUser.trim()) return setError("Nama tidak boleh kosong.");
    if (!namaToko.trim()) return setError("Nama toko tidak boleh kosong.");
    if (!Number.isInteger(angka) || angka < 0) return setError("Batas stok menipis harus bilangan bulat 0 atau lebih.");

    const data: PengaturanData = { namaUser: namaUser.trim(), role, namaToko: namaToko.trim(), batasMenipis: angka };
    simpan(data);
    setError("");
    setTersimpan(true);
    window.setTimeout(() => setTersimpan(false), 2500);
  }

  async function handleResetSemua() {
    const ya = await konfirmasi({
      judul: "Reset semua data?",
      pesan: "Barang, riwayat transaksi, dan pengaturan dikembalikan ke data awal. Tindakan ini tidak bisa dibatalkan.",
      labelYa: "Reset semua",
      bahaya: true,
    });
    if (ya) {
      resetBarang();
      resetTransaksi();
      resetPengaturan();
      window.location.reload();
    }
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pengaturan</h1>
        <p className="mt-2 text-sm text-slate-500">Atur profil dan aturan stok sesuai kebutuhan tokomu.</p>
      </div>

      <form onSubmit={handleSubmit} className={`${kartuClass} max-w-2xl space-y-8`}>
        <section className="space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Profil</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nama" className={labelClass}>Nama</label>
              <input id="nama" value={namaUser} onChange={(e) => setNamaUser(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="role" className={labelClass}>Peran</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
                {ROLE.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Toko dan stok</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="toko" className={labelClass}>Nama toko</label>
              <input id="toko" value={namaToko} onChange={(e) => setNamaToko(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="batas" className={labelClass}>Batas stok menipis</label>
              <input
                id="batas"
                type="number"
                min={0}
                value={batas}
                onChange={(e) => setBatas(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Barang dengan stok sama atau di bawah angka ini dianggap menipis.
              </p>
            </div>
          </div>
        </section>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-500 dark:bg-red-500/10">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700"
          >
            Simpan perubahan
          </button>
          {tersimpan && (
            <span className="flex items-center gap-1 text-sm text-emerald-500" role="status">
              <Check className="h-4 w-4" /> Tersimpan
            </span>
          )}
        </div>
      </form>

      <section className={`${kartuClass} max-w-2xl border-red-100 dark:border-red-500/30`}>
        <h2 className="font-semibold text-red-500">Zona berbahaya</h2>
        <p className="mt-1 text-sm text-slate-500">
          Mengembalikan semua data barang, riwayat transaksi, dan pengaturan ke kondisi awal.
        </p>
        <button
          onClick={handleResetSemua}
          className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:border-red-500/40 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          Reset semua data
        </button>
      </section>
    </>
  );
}
