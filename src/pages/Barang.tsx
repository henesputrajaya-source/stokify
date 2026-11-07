import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, PackageOpen } from "lucide-react";
import BarangFormModal from "../components/BarangFormModal";
import { useBarang } from "../context/useBarang";
import { rupiah } from "../data/barang";
import ProdukThumb from "../components/ProdukThumb";
import { useConfirm } from "../context/useConfirm";
import { useSettings } from "../context/useSettings";
import { KATEGORI } from "../types";
import type { Barang as BarangItem, BarangInput } from "../types";

export default function Barang() {
  const { items, tambah, ubah, hapus, reset } = useBarang();
  const { pengaturan } = useSettings();
  const konfirmasi = useConfirm();
  // pencarian dan filter "menipis" disimpan di URL (?q=...&filter=menipis),
  // supaya bisa dibuka dari search header, notifikasi, dan banner Dashboard
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const hanyaMenipis = params.get("filter") === "menipis";
  const [filterKategori, setFilterKategori] = useState("Semua");

  function setQuery(v: string) {
    const next = new URLSearchParams(params);
    if (v) next.set("q", v);
    else next.delete("q");
    setParams(next, { replace: true });
  }

  function setMenipis(v: boolean) {
    const next = new URLSearchParams(params);
    if (v) next.set("filter", "menipis");
    else next.delete("filter");
    setParams(next, { replace: true });
  }
  // null = modal tertutup; { editing: null } = tambah; { editing: barang } = edit
  const [modal, setModal] = useState<{ editing: BarangItem | null } | null>(null);

  const q = query.trim().toLowerCase();
  const tampil = items.filter((b) => {
    const cocokKategori = filterKategori === "Semua" || b.kategori === filterKategori;
    const cocokCari =
      !q ||
      b.nama.toLowerCase().includes(q) ||
      b.sku.toLowerCase().includes(q) ||
      b.kategori.toLowerCase().includes(q);
    const cocokStok = !hanyaMenipis || b.stok <= pengaturan.batasMenipis;
    return cocokKategori && cocokCari && cocokStok;
  });

  function handleSave(data: BarangInput) {
    const editing = modal?.editing;
    if (editing) {
      ubah(editing.id, data);
    } else {
      tambah(data);
    }
    setModal(null);
  }

  async function handleDelete(b: BarangItem) {
    const ya = await konfirmasi({
      judul: "Hapus barang?",
      pesan: `"${b.nama}" akan dihapus dari daftar barang.`,
      labelYa: "Hapus",
      bahaya: true,
    });
    if (ya) hapus(b.id);
  }

  async function handleReset() {
    const ya = await konfirmasi({
      judul: "Reset data barang?",
      pesan: "Semua data barang dikembalikan ke data awal. Perubahan yang sudah kamu buat akan hilang.",
      labelYa: "Reset",
      bahaya: true,
    });
    if (ya) reset();
  }

  return (
    <>
      {/* Judul + tombol tambah */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Barang</h1>
          <p className="mt-2 text-sm text-slate-500">Kelola daftar barang dan stok kamu di sini.</p>
        </div>
        <button
          onClick={() => setModal({ editing: null })}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Tambah Barang
        </button>
      </div>

      {/* Kartu tabel */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
        {/* Pencarian + filter */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, SKU, atau kategori..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:ring-violet-500/20"
            />
          </div>
          <button
            type="button"
            onClick={() => setMenipis(!hanyaMenipis)}
            aria-pressed={hanyaMenipis}
            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
              hanyaMenipis
                ? "border-red-200 bg-red-50 text-red-500 dark:border-red-500/30 dark:bg-red-500/10"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            }`}
          >
            Stok menipis
          </button>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option>Semua</option>
            {KATEGORI.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
                <th className="pb-3 font-medium">Barang</th>
                <th className="pb-3 font-medium">Kategori</th>
                <th className="pb-3 font-medium">Stok</th>
                <th className="pb-3 font-medium">Harga</th>
                <th className="pb-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {tampil.map((b) => {
                const menipis = b.stok <= pengaturan.batasMenipis;
                return (
                  <tr key={b.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <ProdukThumb gambar={b.gambar} kategori={b.kategori} className="h-10 w-10 rounded-xl" emojiClass="text-xl" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{b.nama}</p>
                          <p className="text-xs text-slate-400">{b.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{b.kategori}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          menipis
                            ? "bg-red-50 text-red-500 dark:bg-red-500/10"
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                        }`}
                      >
                        {b.stok} {b.satuan}
                      </span>
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-200">{rupiah(b.harga)}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setModal({ editing: b })}
                          aria-label={`Edit ${b.nama}`}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-slate-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          aria-label={`Hapus ${b.nama}`}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-slate-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {tampil.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-slate-500">
              <PackageOpen className="h-10 w-10" />
              <p className="text-sm">Tidak ada barang yang cocok.</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <p>
            Menampilkan {tampil.length} dari {items.length} barang
          </p>
          <button onClick={handleReset} className="text-slate-400 underline hover:text-violet-600">
            Reset ke data awal
          </button>
        </div>
      </section>

      {/* Modal tambah / edit */}
      {modal && (
        <BarangFormModal
          barang={modal.editing}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
