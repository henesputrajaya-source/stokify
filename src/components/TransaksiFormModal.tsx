import { useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import { useBarang } from "../context/useBarang";
import { useTransaksi } from "../context/useTransaksi";
import type { JenisTransaksi } from "../types";

interface TransaksiFormModalProps {
  jenisAwal: JenisTransaksi;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:ring-violet-500/20";

const labelClass = "mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300";

export default function TransaksiFormModal({ jenisAwal, onClose }: TransaksiFormModalProps) {
  const { items } = useBarang();
  const { catat } = useTransaksi();

  const [jenis, setJenis] = useState<JenisTransaksi>(jenisAwal);
  const [barangId, setBarangId] = useState<number>(items[0]?.id ?? 0);
  const [jumlah, setJumlah] = useState("");
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");

  const terpilih = items.find((b) => b.id === barangId);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!terpilih) {
      setError("Pilih barang terlebih dahulu.");
      return;
    }
    const pesan = catat(barangId, jenis, Number(jumlah), catatan);
    if (pesan) {
      setError(pesan);
    } else {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="m-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Catat Transaksi</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pilihan jenis */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-700">
          <button
            type="button"
            onClick={() => setJenis("masuk")}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              jenis === "masuk"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Stok Masuk
          </button>
          <button
            type="button"
            onClick={() => setJenis("keluar")}
            className={`rounded-lg py-2 text-sm font-medium transition ${
              jenis === "keluar"
                ? "bg-red-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Stok Keluar
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Barang</label>
            <select
              className={inputClass}
              value={barangId}
              onChange={(e) => setBarangId(Number(e.target.value))}
            >
              {items.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nama} ({b.sku})
                </option>
              ))}
            </select>
            {terpilih && (
              <p className="mt-1.5 text-xs text-slate-500">
                Stok saat ini: {terpilih.stok} {terpilih.satuan}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Jumlah{terpilih ? ` (${terpilih.satuan})` : ""}</label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Contoh: 20"
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Catatan (opsional)</label>
            <input
              className={inputClass}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Restock dari supplier"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
