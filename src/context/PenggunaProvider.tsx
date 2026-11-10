import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { PenggunaContext } from "./PenggunaContext";
import type { PenggunaContextValue } from "./PenggunaContext";
import { buatDataAwal } from "../data/pengguna";
import type { Pengguna, PenggunaInput } from "../data/pengguna";

const KEY = "stokify.pengguna";

function muat(): Pengguna[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const tersimpan = JSON.parse(raw) as Pengguna[];
      if (Array.isArray(tersimpan)) return tersimpan;
    }
  } catch {
    /* data rusak atau storage tidak tersedia: pakai data awal */
  }
  return buatDataAwal();
}

// mengembalikan pesan error, atau null jika data valid
function periksa(items: Pengguna[], data: PenggunaInput, idSendiri?: number): string | null {
  if (!data.nama.trim()) return "Nama wajib diisi.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return "Format email tidak valid.";
  const email = data.email.trim().toLowerCase();
  if (items.some((p) => p.id !== idSendiri && p.email.toLowerCase() === email)) {
    return "Email sudah dipakai pengguna lain.";
  }
  return null;
}

export default function PenggunaProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Pengguna[]>(muat);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* abaikan jika storage penuh atau diblokir */
    }
  }, [items]);

  const value: PenggunaContextValue = {
    items,
    tambah: (data) => {
      const galat = periksa(items, data);
      if (galat) return galat;
      const bersih = { nama: data.nama.trim(), email: data.email.trim(), role: data.role };
      setItems((prev) => [
        { id: Math.max(0, ...prev.map((p) => p.id)) + 1, ...bersih, dibuat: new Date().toISOString() },
        ...prev,
      ]);
      return null;
    },
    ubah: (id, data) => {
      const galat = periksa(items, data, id);
      if (galat) return galat;
      const lama = items.find((p) => p.id === id);
      // jangan sampai tidak ada Admin sama sekali
      if (lama?.role === "Admin" && data.role !== "Admin" && items.filter((p) => p.role === "Admin").length <= 1) {
        return "Harus ada minimal satu Admin.";
      }
      const bersih = { nama: data.nama.trim(), email: data.email.trim(), role: data.role };
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...bersih } : p)));
      return null;
    },
    hapus: (id) => {
      const target = items.find((p) => p.id === id);
      if (target?.role === "Admin" && items.filter((p) => p.role === "Admin").length <= 1) {
        return "Admin terakhir tidak bisa dihapus.";
      }
      setItems((prev) => prev.filter((p) => p.id !== id));
      return null;
    },
    reset: () => setItems(buatDataAwal()),
  };

  return <PenggunaContext.Provider value={value}>{children}</PenggunaContext.Provider>;
}
