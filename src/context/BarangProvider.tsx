import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { BarangContext } from "./BarangContext";
import type { BarangContextValue } from "./BarangContext";
import { dataAwal } from "../data/barang";
import type { Barang } from "../types";

const KEY = "stokify.barang";
const VERSI_KEY = "stokify.barang.versi";

// baca data tersimpan di browser; kalau belum ada, pakai data awal
function muat(): Barang[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const tersimpan = JSON.parse(raw) as Barang[];
      // data lama belum punya foto: isi sekali dari data awal (berdasarkan SKU), lalu tandai selesai
      // supaya foto yang sengaja dihapus pengguna tidak muncul lagi
      if (localStorage.getItem(VERSI_KEY) !== "2") {
        localStorage.setItem(VERSI_KEY, "2");
        return tersimpan.map((b) => (b.gambar ? b : { ...b, gambar: dataAwal.find((d) => d.sku === b.sku)?.gambar }));
      }
      return tersimpan;
    }
  } catch {
    /* data rusak atau storage tidak tersedia: pakai data awal */
  }
  return dataAwal;
}

export default function BarangProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Barang[]>(muat);

  // setiap data berubah, simpan ke browser
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
      localStorage.setItem(VERSI_KEY, "2"); // data sudah bermigrasi; foto yang dihapus tidak diisi ulang
    } catch {
      /* abaikan jika storage penuh atau diblokir */
    }
  }, [items]);

  const value: BarangContextValue = {
    items,
    tambah: (data) =>
      setItems((prev) => [{ id: Math.max(0, ...prev.map((b) => b.id)) + 1, ...data }, ...prev]),
    ubah: (id, data) =>
      setItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b))),
    hapus: (id) => setItems((prev) => prev.filter((b) => b.id !== id)),
    reset: () => setItems(dataAwal),
  };

  return <BarangContext.Provider value={value}>{children}</BarangContext.Provider>;
}
