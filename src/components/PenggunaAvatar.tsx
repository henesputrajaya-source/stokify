import { inisial } from "../data/pengguna";

// warna avatar bergantian berdasarkan id, supaya tiap pengguna konsisten
const WARNA = [
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
];

interface PenggunaAvatarProps {
  // id dari backend berupa UUID (teks), bukan angka
  id: string;
  nama: string;
  className?: string;
}

// ubah teks id menjadi angka tetap, supaya warna tiap pengguna konsisten
function hitungIndeks(id: string): number {
  let total = 0;
  for (let i = 0; i < id.length; i++) {
    total = (total + id.charCodeAt(i)) % 1000;
  }
  return total % WARNA.length;
}

export default function PenggunaAvatar({ id, nama, className = "h-10 w-10 text-sm" }: PenggunaAvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${WARNA[hitungIndeks(id)]} ${className}`}
    >
      {inisial(nama)}
    </div>
  );
}
