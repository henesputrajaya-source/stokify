import { useState } from "react";
import { emojiKategori } from "../data/barang";

interface ProdukThumbProps {
  gambar?: string;
  kategori: string;
  // ukuran dan bentuk, mis. "h-12 w-12 rounded-xl"
  className?: string;
  emojiClass?: string;
}

// Foto produk; kalau tidak ada atau gagal dimuat, tampilkan emoji kategori.
export default function ProdukThumb({
  gambar,
  kategori,
  className = "h-12 w-12 rounded-xl",
  emojiClass = "text-2xl",
}: ProdukThumbProps) {
  const [gagal, setGagal] = useState<string | undefined>();

  if (gambar && gagal !== gambar) {
    return (
      <img
        src={gambar}
        alt=""
        loading="lazy"
        onError={() => setGagal(gambar)}
        className={`${className} shrink-0 bg-slate-100 object-cover dark:bg-slate-700`}
      />
    );
  }
  return (
    <div className={`${className} flex shrink-0 items-center justify-center bg-slate-100 dark:bg-slate-700 ${emojiClass}`}>
      {emojiKategori[kategori] ?? "📦"}
    </div>
  );
}
