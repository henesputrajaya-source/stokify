import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { TransaksiContext } from "./TransaksiContext";
import type { TransaksiContextValue } from "./TransaksiContext";
import { useBarang } from "./useBarang";
import { buatDataAwal } from "../data/transaksi";
import type { Transaksi } from "../types";

const KEY = "stokify.transaksi";

function muat(): Transaksi[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Transaksi[];
  } catch {
    /* data rusak atau storage tidak tersedia: pakai data awal */
  }
  return buatDataAwal();
}

export default function TransaksiProvider({ children }: { children: ReactNode }) {
  const { items, ubah } = useBarang();
  const [daftar, setDaftar] = useState<Transaksi[]>(muat);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(daftar));
    } catch {
      /* abaikan jika storage penuh atau diblokir */
    }
  }, [daftar]);

  const value: TransaksiContextValue = {
    daftar,
    reset: () => setDaftar(buatDataAwal()),
    catat: (barangId, jenis, jumlah, catatan) => {
      const barang = items.find((b) => b.id === barangId);
      if (!barang) return "Barang tidak ditemukan.";
      if (!Number.isFinite(jumlah) || jumlah <= 0) return "Jumlah harus lebih dari 0.";
      if (jenis === "keluar" && jumlah > barang.stok) {
        return `Stok tidak cukup. Sisa stok ${barang.stok} ${barang.satuan}.`;
      }

      // 1) ubah stok barang
      const stokBaru = jenis === "masuk" ? barang.stok + jumlah : barang.stok - jumlah;
      ubah(barang.id, {
        nama: barang.nama,
        sku: barang.sku,
        kategori: barang.kategori,
        satuan: barang.satuan,
        harga: barang.harga,
        stok: stokBaru,
      });

      // 2) simpan riwayat transaksi
      setDaftar((prev) => [
        {
          id: Math.max(0, ...prev.map((t) => t.id)) + 1,
          barangId: barang.id,
          nama: barang.nama,
          satuan: barang.satuan,
          jenis,
          jumlah,
          catatan: catatan.trim(),
          waktu: new Date().toISOString(),
        },
        ...prev,
      ]);
      return null;
    },
  };

  return <TransaksiContext.Provider value={value}>{children}</TransaksiContext.Provider>;
}
