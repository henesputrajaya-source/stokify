import type { JenisTransaksi, Transaksi } from "../types";

const JAM = 60 * 60 * 1000;
const HARI = 24 * JAM;

// data contoh: waktunya dihitung mundur dari sekarang supaya selalu terlihat "baru"
export function buatDataAwal(): Transaksi[] {
  const sekarang = Date.now();
  const t = (
    id: number,
    barangId: number,
    nama: string,
    satuan: string,
    jenis: JenisTransaksi,
    jumlah: number,
    selisih: number,
    catatan = ""
  ): Transaksi => ({
    id,
    barangId,
    nama,
    satuan,
    jenis,
    jumlah,
    catatan,
    waktu: new Date(sekarang - selisih).toISOString(),
  });

  return [
    t(1, 4, "Susu UHT", "pcs", "masuk", 50, 4 * JAM, "Restock dari supplier"),
    t(2, 1, "Kopi Arabica", "pcs", "keluar", 20, 5 * JAM),
    t(3, 5, "Air Mineral 600ml", "pcs", "masuk", 100, 1 * HARI + 2 * JAM, "Restock mingguan"),
    t(4, 2, "Teh Hijau", "pcs", "keluar", 12, 1 * HARI + 5 * JAM),
    t(5, 3, "Gula Pasir", "kg", "keluar", 15, 2 * HARI + 3 * JAM),
    t(6, 6, "Beras Premium", "kg", "masuk", 30, 2 * HARI + 6 * JAM),
    t(7, 1, "Kopi Arabica", "pcs", "keluar", 18, 3 * HARI + 1 * JAM),
    t(8, 7, "Minyak Goreng", "liter", "masuk", 20, 3 * HARI + 4 * JAM),
    t(9, 8, "Biskuit Cokelat", "pcs", "keluar", 25, 4 * HARI + 2 * JAM),
    t(10, 4, "Susu UHT", "pcs", "keluar", 30, 4 * HARI + 7 * JAM),
    t(11, 2, "Teh Hijau", "pcs", "masuk", 10, 5 * HARI + 3 * JAM),
    t(12, 5, "Air Mineral 600ml", "pcs", "keluar", 70, 5 * HARI + 5 * JAM),
    t(13, 3, "Gula Pasir", "kg", "masuk", 10, 6 * HARI + 2 * JAM),
    t(14, 1, "Kopi Arabica", "pcs", "keluar", 22, 6 * HARI + 4 * JAM),
  ];
}

// "Hari ini, 09:24" / "Kemarin, 17:30" / "3 Nov, 10:15"
export function formatWaktu(iso: string): string {
  const d = new Date(iso);
  const jam = d
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(".", ":");

  const hariIni = new Date();
  const kemarin = new Date();
  kemarin.setDate(kemarin.getDate() - 1);

  if (d.toDateString() === hariIni.toDateString()) return `Hari ini, ${jam}`;
  if (d.toDateString() === kemarin.toDateString()) return `Kemarin, ${jam}`;
  return `${d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}, ${jam}`;
}

export interface RingkasHari {
  key: string;
  hari: string; // label sumbu x, mis. "6 Nov"
  masuk: number;
  keluar: number;
}

// total stok masuk dan keluar per hari untuk n hari terakhir (termasuk hari ini)
export function ringkasanHari(daftar: Transaksi[], n: number): RingkasHari[] {
  const hasil: RingkasHari[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    hasil.push({
      key: d.toDateString(),
      hari: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      masuk: 0,
      keluar: 0,
    });
  }

  for (const t of daftar) {
    const slot = hasil.find((h) => h.key === new Date(t.waktu).toDateString());
    if (slot) slot[t.jenis] += t.jumlah;
  }
  return hasil;
}

export const ringkasan7Hari = (daftar: Transaksi[]) => ringkasanHari(daftar, 7);

function awalHari(selisihHari: number): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - selisihHari);
  return d.getTime();
}

// total jumlah per jenis untuk rentang hari: dariHari..sampaiHari = berapa hari lalu (0 = hari ini)
export function totalRentang(
  daftar: Transaksi[],
  jenis: JenisTransaksi,
  dariHari: number,
  sampaiHari: number
): number {
  const mulai = awalHari(dariHari);
  const akhir = awalHari(sampaiHari - 1); // awal hari berikutnya setelah sampaiHari
  return daftar
    .filter((t) => {
      const w = new Date(t.waktu).getTime();
      return t.jenis === jenis && w >= mulai && w < akhir;
    })
    .reduce((total, t) => total + t.jumlah, 0);
}

export interface Perubahan {
  teks: string;
  naik: boolean;
}

// perbandingan nilai sekarang dengan periode sebelumnya, mis. "+12%"
export function hitungPerubahan(sekarang: number, sebelumnya: number): Perubahan {
  if (sebelumnya === 0) {
    return sekarang === 0 ? { teks: "0%", naik: true } : { teks: "Baru", naik: true };
  }
  const persen = Math.round(((sekarang - sebelumnya) / sebelumnya) * 100);
  return { teks: `${persen >= 0 ? "+" : ""}${persen}%`, naik: persen >= 0 };
}

// transaksi dalam n hari terakhir (termasuk hari ini); n = 0 berarti semua
export function dalamPeriode(daftar: Transaksi[], hari: number): Transaksi[] {
  if (hari === 0) return daftar;
  const mulai = awalHari(hari - 1);
  return daftar.filter((t) => new Date(t.waktu).getTime() >= mulai);
}

export const tahunIni = () => new Date().getFullYear();
