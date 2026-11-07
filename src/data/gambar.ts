const MAKS_SISI = 192; // px, cukup tajam untuk thumbnail dan hemat ruang localStorage
const MAKS_UKURAN_FILE = 5 * 1024 * 1024; // 5 MB

// Baca file gambar, perkecil, lalu kembalikan sebagai data URL JPEG. Melempar Error berisi pesan untuk pengguna.
export async function perkecilGambar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar (JPG, PNG, atau WebP).");
  if (file.size > MAKS_UKURAN_FILE) throw new Error("Ukuran gambar maksimal 5 MB.");

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Gambar tidak bisa dibaca."));
      el.src = url;
    });

    const skala = Math.min(1, MAKS_SISI / Math.max(img.width, img.height));
    const lebar = Math.max(1, Math.round(img.width * skala));
    const tinggi = Math.max(1, Math.round(img.height * skala));

    const canvas = document.createElement("canvas");
    canvas.width = lebar;
    canvas.height = tinggi;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Gambar tidak bisa diproses.");
    ctx.fillStyle = "#ffffff"; // latar putih supaya PNG transparan tidak jadi hitam
    ctx.fillRect(0, 0, lebar, tinggi);
    ctx.drawImage(img, 0, 0, lebar, tinggi);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}
