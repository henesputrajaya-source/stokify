import { useState } from "react";
import { Download, PackagePlus, PackageMinus, ClipboardList, Coins } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useBarang } from "../context/useBarang";
import { useTransaksi } from "../context/useTransaksi";
import { dalamPeriode } from "../data/transaksi";
import { rupiah } from "../data/barang";
import { unduhCsv } from "../data/csv";

const PERIODE = [
  { hari: 7, label: "7 hari terakhir" },
  { hari: 30, label: "30 hari terakhir" },
  { hari: 0, label: "Semua waktu" },
];

const kartuClass =
  "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800";

function Ringkasan({ label, value, icon: Icon, warna }: { label: string; value: string; icon: LucideIcon; warna: string }) {
  return (
    <div className={`${kartuClass} flex items-center gap-4 p-5`}>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${warna}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="truncate text-xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

// 1.250.000 -> "1,3 jt", 45.000 -> "45 rb"
function singkat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} rb`;
  return String(n);
}

// tanggal untuk nama file, mis. "2026-11-06"
const stempel = () => new Date().toISOString().slice(0, 10);

export default function Laporan() {
  const { items } = useBarang();
  const { daftar } = useTransaksi();
  const [hari, setHari] = useState(7);

  const trx = dalamPeriode(daftar, hari);
  const totalMasuk = trx.filter((t) => t.jenis === "masuk").reduce((n, t) => n + t.jumlah, 0);
  const totalKeluar = trx.filter((t) => t.jenis === "keluar").reduce((n, t) => n + t.jumlah, 0);
  const nilaiStok = items.reduce((n, b) => n + b.stok * b.harga, 0);

  // nilai stok per kategori
  const perKategori = new Map<string, number>();
  for (const b of items) perKategori.set(b.kategori, (perKategori.get(b.kategori) ?? 0) + b.stok * b.harga);
  const dataKategori = [...perKategori.entries()]
    .map(([kategori, nilai]) => ({ kategori, nilai }))
    .sort((a, b) => b.nilai - a.nilai);

  // barang paling banyak keluar dalam periode
  const keluarPerBarang = new Map<number, number>();
  for (const t of trx) {
    if (t.jenis === "keluar") keluarPerBarang.set(t.barangId, (keluarPerBarang.get(t.barangId) ?? 0) + t.jumlah);
  }
  const terlaris = [...keluarPerBarang.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .flatMap(([id, jumlah]) => {
      const b = items.find((x) => x.id === id);
      return b ? [{ id, nama: b.nama, kategori: b.kategori, satuan: b.satuan, jumlah, nilai: jumlah * b.harga }] : [];
    });

  const label = PERIODE.find((p) => p.hari === hari)?.label ?? "";

  function eksporTransaksi() {
    const baris: (string | number)[][] = [["Waktu", "Barang", "Jenis", "Jumlah", "Satuan", "Catatan"]];
    for (const t of [...trx].sort((a, b) => b.waktu.localeCompare(a.waktu))) {
      baris.push([
        new Date(t.waktu).toLocaleString("id-ID"),
        t.nama,
        t.jenis === "masuk" ? "Masuk" : "Keluar",
        t.jumlah,
        t.satuan,
        t.catatan,
      ]);
    }
    unduhCsv(`transaksi-${stempel()}.csv`, baris);
  }

  function eksporStok() {
    const baris: (string | number)[][] = [["Nama", "SKU", "Kategori", "Stok", "Satuan", "Harga", "Nilai Stok"]];
    for (const b of items) baris.push([b.nama, b.sku, b.kategori, b.stok, b.satuan, b.harga, b.stok * b.harga]);
    unduhCsv(`stok-${stempel()}.csv`, baris);
  }

  const tombolEkspor =
    "flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600";

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Laporan</h1>
          <p className="mt-2 text-sm text-slate-500">Ringkasan pergerakan stok dan nilai persediaan kamu.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={hari}
            onChange={(e) => setHari(Number(e.target.value))}
            aria-label="Pilih periode laporan"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            {PERIODE.map((p) => (
              <option key={p.hari} value={p.hari}>
                {p.label}
              </option>
            ))}
          </select>
          <button onClick={eksporTransaksi} className={tombolEkspor}>
            <Download className="h-4 w-4" />
            Ekspor transaksi
          </button>
          <button onClick={eksporStok} className={tombolEkspor}>
            <Download className="h-4 w-4" />
            Ekspor stok
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Ringkasan label={`Stok masuk (${label.toLowerCase()})`} value={`+${totalMasuk}`} icon={PackagePlus} warna="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300" />
        <Ringkasan label={`Stok keluar (${label.toLowerCase()})`} value={`-${totalKeluar}`} icon={PackageMinus} warna="bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-300" />
        <Ringkasan label="Jumlah transaksi" value={String(trx.length)} icon={ClipboardList} warna="bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300" />
        <Ringkasan label="Nilai stok saat ini" value={rupiah(nilaiStok)} icon={Coins} warna="bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className={kartuClass}>
          <h2 className="font-semibold text-slate-900 dark:text-white">Nilai stok per kategori</h2>
          <p className="mb-4 text-xs text-slate-500">Stok saat ini dikali harga, dikelompokkan per kategori.</p>
          {dataKategori.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">Belum ada barang.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataKategori} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="kategori" tick={{ fontSize: 11, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={singkat}
                    tick={{ fontSize: 11, fill: "var(--chart-text)" }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    formatter={(v) => [rupiah(Number(v)), "Nilai stok"]}
                    cursor={{ fill: "var(--chart-grid)", opacity: 0.4 }}
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.12)" }}
                  />
                  <Bar dataKey="nilai" fill="#7c5cf0" radius={[8, 8, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className={kartuClass}>
          <h2 className="font-semibold text-slate-900 dark:text-white">Barang terlaris</h2>
          <p className="mb-4 text-xs text-slate-500">Paling banyak keluar, {label.toLowerCase()}.</p>
          {terlaris.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">Belum ada stok keluar pada periode ini.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
                  <th className="pb-3 font-medium">Barang</th>
                  <th className="pb-3 font-medium">Keluar</th>
                  <th className="pb-3 text-right font-medium">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {terlaris.map((b, i) => (
                  <tr key={b.id}>
                    <td className="py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        <span className="mr-2 text-slate-400">{i + 1}.</span>
                        {b.nama}
                      </p>
                      <p className="pl-5 text-xs text-slate-400">{b.kategori}</p>
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-200">
                      {b.jumlah} {b.satuan}
                    </td>
                    <td className="py-3 text-right text-slate-700 dark:text-slate-200">{rupiah(b.nilai)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}
