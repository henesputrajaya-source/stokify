export interface Barang {
  id: number;
  nama: string;
  sku: string;
  kategori: string;
  stok: number;
  satuan: string;
  harga: number;
  // URL gambar (mis. "/produk/kopi.png") atau data URL dari upload; kosong = pakai emoji kategori
  gambar?: string;
}

// data form = Barang tanpa id (id dibuat saat disimpan)
export type BarangInput = Omit<Barang, "id">;

export const KATEGORI = ["Minuman", "Bahan Pokok", "Makanan", "Lainnya"];
export const SATUAN = ["pcs", "kg", "liter"];

export type JenisTransaksi = "masuk" | "keluar";

export interface Transaksi {
  id: number;
  barangId: number;
  nama: string; // salinan nama barang saat transaksi dicatat
  satuan: string;
  jenis: JenisTransaksi;
  jumlah: number;
  catatan: string;
  waktu: string; // format ISO
}
