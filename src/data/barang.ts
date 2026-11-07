import type { Barang } from "../types";

export const dataAwal: Barang[] = [
  { id: 1, nama: "Kopi Arabica", sku: "KP-001", kategori: "Minuman", stok: 5, satuan: "pcs", harga: 45000, gambar: "/produk/kopi-arabica.png" },
  { id: 2, nama: "Teh Hijau", sku: "TH-002", kategori: "Minuman", stok: 8, satuan: "pcs", harga: 28000, gambar: "/produk/teh-hijau.png" },
  { id: 3, nama: "Gula Pasir", sku: "GP-003", kategori: "Bahan Pokok", stok: 10, satuan: "kg", harga: 16000, gambar: "/produk/gula-pasir.png" },
  { id: 4, nama: "Susu UHT", sku: "SU-004", kategori: "Minuman", stok: 74, satuan: "pcs", harga: 7500 },
  { id: 5, nama: "Air Mineral 600ml", sku: "AM-005", kategori: "Minuman", stok: 210, satuan: "pcs", harga: 3500 },
  { id: 6, nama: "Beras Premium", sku: "BR-006", kategori: "Bahan Pokok", stok: 45, satuan: "kg", harga: 14500 },
  { id: 7, nama: "Minyak Goreng", sku: "MG-007", kategori: "Bahan Pokok", stok: 32, satuan: "liter", harga: 18000 },
  { id: 8, nama: "Biskuit Cokelat", sku: "BC-008", kategori: "Makanan", stok: 60, satuan: "pcs", harga: 9000 },
];

export const emojiKategori: Record<string, string> = {
  Minuman: "☕",
  "Bahan Pokok": "🧂",
  Makanan: "🍪",
  Lainnya: "📦",
};

export const rupiah = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);
