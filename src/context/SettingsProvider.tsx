import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { SettingsContext, PENGATURAN_AWAL } from "./SettingsContext";
import type { Pengaturan, SettingsContextValue } from "./SettingsContext";

const KEY = "stokify.pengaturan";

function muat(): Pengaturan {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...PENGATURAN_AWAL, ...(JSON.parse(raw) as Partial<Pengaturan>) };
  } catch {
    /* data rusak atau storage tidak tersedia: pakai pengaturan awal */
  }
  return PENGATURAN_AWAL;
}

export default function SettingsProvider({ children }: { children: ReactNode }) {
  const [pengaturan, setPengaturan] = useState<Pengaturan>(muat);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(pengaturan));
    } catch {
      /* abaikan jika storage penuh atau diblokir */
    }
  }, [pengaturan]);

  const value: SettingsContextValue = {
    pengaturan,
    simpan: setPengaturan,
    reset: () => setPengaturan(PENGATURAN_AWAL),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
