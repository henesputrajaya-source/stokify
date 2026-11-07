import { createContext } from "react";

export interface Pengaturan {
  namaUser: string;
  role: string;
  namaToko: string;
  batasMenipis: number;
}

export const PENGATURAN_AWAL: Pengaturan = {
  namaUser: "Tedi Saputra",
  role: "Admin",
  namaToko: "Toko Saya",
  batasMenipis: 10,
};

export interface SettingsContextValue {
  pengaturan: Pengaturan;
  simpan: (data: Pengaturan) => void;
  reset: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);
