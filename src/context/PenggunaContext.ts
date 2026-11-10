import { createContext } from "react";
import type { Pengguna, PenggunaInput } from "../data/pengguna";

// fungsi yang bisa gagal mengembalikan pesan error, atau null jika berhasil
export interface PenggunaContextValue {
  items: Pengguna[];
  tambah: (data: PenggunaInput) => string | null;
  ubah: (id: number, data: PenggunaInput) => string | null;
  hapus: (id: number) => string | null;
  reset: () => void;
}

export const PenggunaContext = createContext<PenggunaContextValue | null>(null);
