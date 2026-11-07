# Stokify

Aplikasi web manajemen stok barang. Saat ini berupa frontend saja: semua data disimpan di
`localStorage` browser, belum ada backend.

## Fitur

- **Beranda**: ringkasan stok, grafik pergerakan stok (7/14/30 hari), stok menipis, penjualan cepat, transaksi terbaru
- **Barang**: tambah, ubah, hapus, cari, filter kategori dan stok menipis, foto produk
- **Transaksi**: catat stok masuk/keluar (stok barang ikut berubah otomatis), riwayat yang bisa dicari dan difilter
- **Laporan**: ringkasan per periode, nilai stok per kategori, barang terlaris, ekspor CSV
- **Pengaturan**: profil, nama toko, batas stok menipis, reset data
- Mode gelap dan tampilan responsif (sidebar jadi drawer di layar kecil)

## Teknologi

React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Recharts, Lucide Icons.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
```

Perintah lain:

```bash
npm run build      # type-check lalu build produksi ke dist/
npm run preview    # menjalankan hasil build
npm run lint       # oxlint
```

## Struktur

```
src/
├── components/   Header, Sidebar, modal form, ProdukThumb
├── context/      state global: barang, transaksi, pengaturan, dialog konfirmasi
├── data/         data awal, tipe bantu, format rupiah/waktu, ekspor CSV, perkecil gambar
├── layouts/      MainLayout (sidebar + header + isi halaman)
├── pages/        Dashboard, Barang, Transaksi, Laporan, Pengaturan
└── types.ts      tipe Barang dan Transaksi
public/produk/    foto produk bawaan
```

## Catatan data

Data tersimpan di browser dengan kunci `stokify.barang`, `stokify.transaksi`, `stokify.pengaturan`,
dan `stokify.dark`. Membersihkan data situs akan mengembalikan semuanya ke data awal.
Foto yang diunggah dari form barang diperkecil (maks. 192 px) dan disimpan sebagai data URL.

## Rencana

- Backend (API + database) menggantikan `localStorage`
- Login dan peran pengguna
