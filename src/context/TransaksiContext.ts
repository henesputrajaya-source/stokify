import { createContext } from "react";
import type { JenisTransaksi, Transaksi } from "../types";

export interface TransaksiContextValue {
  daftar: Transaksi[];
  // mengembalikan pesan error, atau null jika berhasil
  reset: () => void;
  catat: (barangId: number, jenis: JenisTransaksi, jumlah: number, catatan: string) => string | null;
}

export const TransaksiContext = createContext<TransaksiContextValue | null>(null);
