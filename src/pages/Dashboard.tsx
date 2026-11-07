import {
  type LucideIcon,
  FileText,
  Bell,
  ChevronRight,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Calendar,
  ChevronDown,
  Zap,
  BarChart3,
  Boxes,
  PackagePlus,
  PackageMinus,
  Coins,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useBarang } from "../context/useBarang";
import { useTransaksi } from "../context/useTransaksi";
import { dalamPeriode, formatWaktu, hitungPerubahan, ringkasanHari, tahunIni, totalRentang } from "../data/transaksi";
import { rupiah } from "../data/barang";
import ProdukThumb from "../components/ProdukThumb";
import { useSettings } from "../context/useSettings";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ----------------------------- DATA DUMMY ----------------------------- */

const statsDasar = {
  totalBarang: { label: "Total Barang", icon: Boxes, iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300", cardBg: "from-violet-50/70" },
  masuk: { label: "Stok Masuk", icon: PackagePlus, iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300", cardBg: "from-emerald-50/70" },
  keluar: { label: "Stok Keluar", icon: PackageMinus, iconBg: "bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-300", cardBg: "from-orange-50/70" },
  nilai: { label: "Nilai Stok", icon: Coins, iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300", cardBg: "from-violet-50/70" },
};

/* ------------------------------ KOMPONEN ------------------------------ */

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  cardBg: string;
  // perubahan dibanding periode sebelumnya (opsional)
  change?: { teks: string; naik: boolean };
  // keterangan biasa jika tidak ada data pembanding
  note?: string;
}

function StatCard({ label, value, icon: Icon, iconBg, cardBg, change, note }: StatCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-slate-100 bg-linear-to-br ${cardBg} to-white p-4 shadow-sm dark:border-slate-800 dark:from-slate-800 dark:to-slate-800 2xl:p-5`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-600 dark:text-slate-400">{label}</p>
        <p
          className={`truncate font-bold text-slate-900 dark:text-white ${value.length > 8 ? "text-lg" : "text-2xl"}`}
          title={value}
        >
          {value}
        </p>
        {change ? (
          <p className="flex items-center gap-1 text-[11px]">
            <span className={`flex items-center font-medium ${change.naik ? "text-emerald-500" : "text-red-500"}`}>
              {change.naik ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {change.teks}
            </span>
            <span className="text-slate-400">vs minggu lalu</span>
          </p>
        ) : (
          <p className="text-[11px] text-slate-400">{note}</p>
        )}
      </div>
    </div>
  );
}

interface TooltipItem {
  name?: string;
  value?: number;
  color?: string;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white px-3 py-2 text-xs shadow-lg dark:bg-slate-700 dark:text-white">
      <p className="mb-1 font-semibold text-slate-900 dark:text-white">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-slate-600 dark:text-slate-200">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// titik hanya di data pertama dan terakhir, seperti di desain
function ujungDot(warna: string, total: number) {
  return (props: { cx?: number; cy?: number; index?: number }) => {
    const { cx, cy, index } = props;
    if (cx === undefined || cy === undefined || (index !== 0 && index !== total - 1)) {
      return <g key={index} />;
    }
    return <circle key={index} cx={cx} cy={cy} r={3.5} fill={warna} stroke="#fff" strokeWidth={1.5} />;
  };
}

function StockChart() {
  const { daftar } = useTransaksi();
  const [jumlahHari, setJumlahHari] = useState(7);
  const data = ringkasanHari(daftar, jumlahHari);
  const rentang = `${data[0].hari} - ${data[data.length - 1].hari} ${tahunIni()}`;

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/20">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Pergerakan Stok</h2>
            <p className="text-xs text-slate-500">Grafik stok masuk dan keluar dalam {jumlahHari} hari terakhir</p>
          </div>
        </div>

        <label className="relative flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200">
          <Calendar className="h-4 w-4" />
          <span>{rentang}</span>
          <ChevronDown className="h-4 w-4" />
          <select
            value={jumlahHari}
            onChange={(e) => setJumlahHari(Number(e.target.value))}
            aria-label="Pilih rentang grafik"
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            <option value={7}>7 hari terakhir</option>
            <option value={14}>14 hari terakhir</option>
            <option value={30}>30 hari terakhir</option>
          </select>
        </label>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gMasuk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c5cf0" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#7c5cf0" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gKeluar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb923c" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#fb923c" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="hari" interval="preserveStartEnd" minTickGap={24} tick={{ fontSize: 11, fill: "var(--chart-text)" }} axisLine={false} tickLine={false} />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "var(--chart-text)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--chart-grid)" }} />
            <Area type="monotone" dataKey="masuk" name="Stok Masuk" stroke="#7c5cf0" strokeWidth={2} fill="url(#gMasuk)" dot={ujungDot("#7c5cf0", data.length)} activeDot={{ r: 4 }} />
            <Area type="monotone" dataKey="keluar" name="Stok Keluar" stroke="#fb923c" strokeWidth={2} fill="url(#gKeluar)" dot={ujungDot("#fb923c", data.length)} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet-600" /> Stok Masuk
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-400" /> Stok Keluar
        </span>
      </div>
    </section>
  );
}

function QuickSales() {
  const { daftar } = useTransaksi();
  const { items } = useBarang();

  // total barang keluar per barang dalam 7 hari terakhir
  const jumlahPerBarang = new Map<number, number>();
  for (const trx of dalamPeriode(daftar, 7)) {
    if (trx.jenis === "keluar") {
      jumlahPerBarang.set(trx.barangId, (jumlahPerBarang.get(trx.barangId) ?? 0) + trx.jumlah);
    }
  }
  const teratas = [...jumlahPerBarang.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .flatMap(([id, terjual]) => {
      const b = items.find((x) => x.id === id);
      return b
        ? [{ id, nama: b.nama, kategori: b.kategori, terjual, gambar: b.gambar }]
        : [];
    });

  return (
    <section>
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Zap className="mt-0.5 h-5 w-5 text-violet-600" />
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Penjualan Cepat</h2>
            <p className="text-xs text-slate-500">Barang paling banyak keluar dalam 7 hari terakhir</p>
          </div>
        </div>
        <Link to="/transaksi?jenis=keluar" className="flex items-center gap-1 text-xs font-medium text-violet-600">
          Lihat Semua <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {teratas.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-800"
          >
            <ProdukThumb gambar={item.gambar} kategori={item.kategori} />
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.nama}</p>
              <p className="text-[11px] text-slate-400">{item.kategori}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{item.terjual}</p>
              <p className="text-[11px] text-slate-500">Terjual</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LowStock() {
  const { items } = useBarang();
  const { pengaturan } = useSettings();
  const menipis = items.filter((b) => b.stok <= pengaturan.batasMenipis).sort((a, b) => a.stok - b.stok);
  const daftar = menipis.slice(0, 3).map((b) => ({
    id: b.id,
    nama: b.nama,
    kategori: b.kategori,
    sisa: `${b.stok} ${b.satuan}`,
    gambar: b.gambar,
  }));

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/20">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">Stok Menipis</h2>
          <p className="text-xs text-slate-500">Barang yang perlu perhatian</p>
        </div>
      </div>

      <Link
        to="/barang?filter=menipis"
        className="mb-4 flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-500 dark:bg-red-500/10"
      >
        <AlertTriangle className="h-5 w-5" />
        <span className="flex-1">{menipis.length} barang hampir habis</span>
        <ChevronRight className="h-4 w-4" />
      </Link>

      <ul className="space-y-2">
        {daftar.map((item) => (
          <li key={item.id}>
            <Link
              to={`/barang?q=${encodeURIComponent(item.nama)}`}
              className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-slate-700/50"
            >
            <ProdukThumb gambar={item.gambar} kategori={item.kategori} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.nama}</p>
              <p className="text-xs text-slate-500">{item.kategori}</p>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-500 dark:bg-red-500/10">
              {item.sisa}
            </span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RecentTransactions() {
  const { daftar } = useTransaksi();
  const { items } = useBarang();

  const terbaru = [...daftar]
    .sort((a, b) => b.waktu.localeCompare(a.waktu))
    .slice(0, 3)
    .map((trx) => ({
      id: trx.id,
      judul: `${trx.jenis === "masuk" ? "Stok Masuk" : "Stok Keluar"} - ${trx.nama}`,
      kategori: items.find((b) => b.id === trx.barangId)?.kategori ?? "-",
      qty: `${trx.jenis === "masuk" ? "+" : "-"}${trx.jumlah} ${trx.satuan}`,
      waktu: formatWaktu(trx.waktu),
      masuk: trx.jenis === "masuk",
    }));

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 text-violet-600" />
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Transaksi Terbaru</h2>
            <p className="text-xs text-slate-500">Aktivitas stok hari ini</p>
          </div>
        </div>
        <Link to="/transaksi" className="flex items-center gap-1 text-xs font-medium text-violet-600">
          Lihat Semua <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <ul className="divide-y divide-slate-100 dark:divide-slate-700">
        {terbaru.map((trx) => (
          <li key={trx.id} className="flex items-center gap-3 py-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                trx.masuk ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
              }`}
            >
              {trx.masuk ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{trx.judul}</p>
              <p className="text-[11px] text-slate-400">{trx.kategori}</p>
            </div>
            <span className={`text-sm font-semibold ${trx.masuk ? "text-emerald-500" : "text-red-500"}`}>
              {trx.qty}
            </span>
            <span className="hidden w-28 text-right text-xs text-slate-500 sm:block">{trx.waktu}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------- HALAMAN ------------------------------- */

export default function Dashboard() {
  const { items } = useBarang();
  const { pengaturan } = useSettings();
  const { daftar } = useTransaksi();

  // 7 hari terakhir dibanding 7 hari sebelumnya
  const masuk7 = totalRentang(daftar, "masuk", 6, 0);
  const keluar7 = totalRentang(daftar, "keluar", 6, 0);
  const masukLalu = totalRentang(daftar, "masuk", 13, 7);
  const keluarLalu = totalRentang(daftar, "keluar", 13, 7);
  const nilaiStok = items.reduce((total, b) => total + b.stok * b.harga, 0);
  const jumlahKategori = new Set(items.map((b) => b.kategori)).size;
  const jumlahMenipis = items.filter((b) => b.stok <= pengaturan.batasMenipis).length;

  const statsData: StatCardProps[] = [
    { ...statsDasar.totalBarang, value: String(items.length), note: `${jumlahKategori} kategori` },
    { ...statsDasar.masuk, value: String(masuk7), change: hitungPerubahan(masuk7, masukLalu) },
    { ...statsDasar.keluar, value: String(keluar7), change: hitungPerubahan(keluar7, keluarLalu) },
    { ...statsDasar.nilai, value: rupiah(nilaiStok), note: `${jumlahMenipis} barang menipis` },
  ];

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Selamat Datang di Stokify!</h1>
        <svg className="mt-1 h-2 w-16 text-violet-500" viewBox="0 0 64 8" fill="none" aria-hidden="true">
          <path d="M1 4c4-4 8-4 12 0s8 4 12 0 8-4 12 0 8 4 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="mt-3 text-sm text-slate-500">Kelola stok produk kamu jadi lebih mudah dan efisien.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Kolom kiri */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {statsData.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
          <StockChart />
          <QuickSales />
        </div>

        {/* Kolom kanan */}
        <div className="space-y-6">
          <LowStock />
          <RecentTransactions />
        </div>
      </div>
    </>
  );
}
