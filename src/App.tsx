import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { lazy } from "react";

// tiap halaman dimuat saat dibuka (code splitting), supaya muatan awal lebih ringan
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Barang = lazy(() => import("./pages/Barang"));
const Transaksi = lazy(() => import("./pages/Transaksi"));
const Laporan = lazy(() => import("./pages/Laporan"));
const Pengguna = lazy(() => import("./pages/Pengguna"));
const Pengaturan = lazy(() => import("./pages/Pengaturan"));

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="barang" element={<Barang />} />
        <Route path="transaksi" element={<Transaksi />} />
        <Route path="laporan" element={<Laporan />} />
        <Route path="pengguna" element={<Pengguna />} />
        <Route path="pengaturan" element={<Pengaturan />} />
      </Route>
    </Routes>
  );
}
