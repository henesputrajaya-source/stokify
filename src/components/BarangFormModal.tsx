import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import ProdukThumb from "./ProdukThumb";
import { perkecilGambar } from "../data/gambar";
import { KATEGORI, SATUAN } from "../types";
import type { Barang, BarangInput } from "../types";

interface BarangFormModalProps {
  barang: Barang | null; // null = tambah baru, ada isi = edit
  onSave: (data: BarangInput) => void;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:ring-violet-500/20";

const labelClass = "mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300";

export default function BarangFormModal({ barang, onSave, onClose }: BarangFormModalProps) {
  const [form, setForm] = useState<BarangInput>(
    barang
      ? {
          nama: barang.nama,
          sku: barang.sku,
          kategori: barang.kategori,
          stok: barang.stok,
          satuan: barang.satuan,
          harga: barang.harga,
          gambar: barang.gambar,
        }
      : { nama: "", sku: "", kategori: KATEGORI[0], stok: 0, satuan: SATUAN[0], harga: 0 }
  );
  const [error, setError] = useState("");
  const inputFile = useRef<HTMLInputElement>(null);

  async function handlePilihGambar(file: File | undefined) {
    if (!file) return;
    try {
      const gambar = await perkecilGambar(file);
      setForm((f) => ({ ...f, gambar }));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gambar tidak bisa dipakai.");
    }
    if (inputFile.current) inputFile.current.value = ""; // supaya file yang sama bisa dipilih lagi
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.nama.trim() || !form.sku.trim()) {
      setError("Nama barang dan SKU wajib diisi.");
      return;
    }
    if (form.stok < 0 || form.harga < 0) {
      setError("Stok dan harga tidak boleh negatif.");
      return;
    }

    onSave({ ...form, nama: form.nama.trim(), sku: form.sku.trim().toUpperCase() });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="m-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {barang ? "Edit Barang" : "Tambah Barang"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 sm:col-span-2">
            <ProdukThumb gambar={form.gambar} kategori={form.kategori} className="h-16 w-16 rounded-2xl" emojiClass="text-3xl" />
            <div className="flex flex-wrap gap-2">
              <input
                ref={inputFile}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePilihGambar(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => inputFile.current?.click()}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <ImagePlus className="h-4 w-4" />
                {form.gambar ? "Ganti foto" : "Tambah foto"}
              </button>
              {form.gambar && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, gambar: undefined })}
                  className="rounded-xl px-3 py-2 text-sm text-slate-500 hover:text-red-500"
                >
                  Hapus foto
                </button>
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Nama Barang</label>
            <input
              className={inputClass}
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Contoh: Kopi Arabica"
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>SKU</label>
            <input
              className={inputClass}
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="Contoh: KP-001"
            />
          </div>

          <div>
            <label className={labelClass}>Kategori</label>
            <select
              className={inputClass}
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
            >
              {KATEGORI.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Stok</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.stok}
              onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className={labelClass}>Satuan</label>
            <select
              className={inputClass}
              value={form.satuan}
              onChange={(e) => setForm({ ...form, satuan: e.target.value })}
            >
              {SATUAN.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Harga (Rp)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.harga}
              onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })}
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
