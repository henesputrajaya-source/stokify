import { createContext } from "react";

export interface OpsiKonfirmasi {
  judul: string;
  pesan: string;
  labelYa?: string;
  // true = tombol merah (untuk hapus/reset)
  bahaya?: boolean;
}

// mengembalikan true jika pengguna memilih lanjut
export type Konfirmasi = (opsi: OpsiKonfirmasi) => Promise<boolean>;

export const ConfirmContext = createContext<Konfirmasi | null>(null);
