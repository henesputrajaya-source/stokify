import { createContext } from "react";
import type { Barang, BarangInput } from "../types";

export interface BarangContextValue {
  items: Barang[];
  tambah: (data: BarangInput) => void;
  ubah: (id: number, data: BarangInput) => void;
  hapus: (id: number) => void;
  reset: () => void;
}

export const BarangContext = createContext<BarangContextValue | null>(null);
