import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUp, ArrowDown, Search, PackagePlus, PackageMinus, ClipboardList } from "lucide-react";
import TransaksiFormModal from "../components/TransaksiFormModal";
import { useTransaksi } from "../context/useTransaksi";
import { formatWaktu, ringkasan7Hari } from "../data/transaksi";
import type { JenisTransaksi } from "../types";

export default function Transaksi() {
  const { daftar } = useTransaksi();
  const [query, setQuery] = useState("");
  // jenis disimpan di URL (?jenis=keluar) supaya bisa dibuka dari link Dashboard
  const [params, setParams] = useSearchParams();
  const jenisParam = params.get("jenis");
  const filterJenis: "semua" | JenisTransaksi =
    jenisParam === "masuk" || jenisParam === "keluar" ? jenisParam : "semua";

  function setFilterJenis(v: "semua" | JenisTransaksi) {
    const next = new URLSearchParams(params);
    if (v === "semua") next.delete("jenis");
    else next.set("jenis", v);
    setParams(next, { replace: true });
  }
  // null = modal tertutup; selain itu = jenis yang dipilih saat modal dibuka
  const [modal, setModal] = useState<JenisTransaksi | null>(null);

  const ringkas = ringkasan7Hari(daftar);
  const masuk7 = ringkas.reduce((total, h) => total + h.masuk, 0);
  const keluar7 = ringkas.reduce((total, h) => total + h.keluar, 0);

  const q = query.trim().toLowerCase();
  const tampil = [...daftar]
    .sort((a, b) => b.waktu.localeCompare(a.waktu))
    .filter((t) => {
      const cocokJenis = filterJenis === "semua" || t.jenis === filterJenis;
      const cocokCari = !q || t.nama.toLowerCase().includes(q) || t.catatan.toLowerCase().includes(q);
      return cocokJenis && cocokCari;
    });

  return (
    <>
      {/* Judul + tombol catat */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transaksi</h1>
          <p className="mt-2 text-sm text-slate-500">Catat stok masuk dan keluar, stok barang ikut berubah otomatis.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setModal("masuk")}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600"
          >
            <PackagePlus className="h-4 w-4" />
            Stok Masuk
          </button>
          <button
            onClick={() => setModal("keluar")}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-red-600"
          >
            <PackageMinus className="h-4 w-4" />
            Stok Keluar
          </button>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800">
          <p className="text-xs text-slate-500">Stok masuk (7 hari)</p>
          <p className="mt-1 text-2xl font-bold text-emerald-500">+{masuk7}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800">
          <p className="text-xs text-slate-500">Stok keluar (7 hari)</p>
          <p className="mt-1 text-2xl font-bold text-red-500">-{keluar7}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800">
          <p className="text-xs text-slate-500">Total transaksi</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{daftar.length}</p>
        </div>
      </div>

      {/* Riwayat */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama barang atau catatan..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:ring-violet-500/20"
            />
          </div>
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value as "semua" | JenisTransaksi)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="semua">Semua jenis</option>
            <option value="masuk">Stok Masuk</option>
            <option value="keluar">Stok Keluar</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
                <th className="pb-3 font-medium">Waktu</th>
                <th className="pb-3 font-medium">Barang</th>
                <th className="pb-3 font-medium">Jenis</th>
                <th className="pb-3 font-medium">Jumlah</th>
                <th className="pb-3 font-medium">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {tampil.map((t) => {
                const masuk = t.jenis === "masuk";
                return (
                  <tr key={t.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="py-3 text-slate-500">{formatWaktu(t.waktu)}</td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">{t.nama}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                          masuk
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                            : "bg-red-50 text-red-500 dark:bg-red-500/10"
                        }`}
                      >
                        {masuk ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {masuk ? "Masuk" : "Keluar"}
                      </span>
                    </td>
                    <td className={`py-3 font-semibold ${masuk ? "text-emerald-500" : "text-red-500"}`}>
                      {masuk ? "+" : "-"}
                      {t.jumlah} {t.satuan}
                    </td>
                    <td className="py-3 text-slate-500">{t.catatan || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {tampil.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-slate-500">
              <ClipboardList className="h-10 w-10" />
              <p className="text-sm">Belum ada transaksi yang cocok.</p>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Menampilkan {tampil.length} dari {daftar.length} transaksi
        </p>
      </section>

      {modal && <TransaksiFormModal jenisAwal={modal} onClose={() => setModal(null)} />}
    </>
  );
}
