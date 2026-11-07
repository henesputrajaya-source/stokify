import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout() {
  // pilihan tema disimpan di browser supaya tidak reset saat refresh
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("stokify.dark") === "1";
    } catch {
      return false;
    }
  });

  // butuh @custom-variant dark di index.css (Tailwind v4)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("stokify.dark", dark ? "1" : "0");
    } catch {
      /* abaikan jika storage diblokir */
    }
  }, [dark]);

  // drawer sidebar di layar kecil
  const [menuOpen, setMenuOpen] = useState(false);

  // Escape menutup drawer
  useEffect(() => {
    if (!menuOpen) return;
    const tutup = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", tutup);
    return () => document.removeEventListener("keydown", tutup);
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-800 dark:bg-slate-950">
      <Sidebar dark={dark} setDark={setDark} open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* latar gelap di belakang drawer (hanya layar kecil) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenu={() => setMenuOpen(true)} />

        <main className="flex-1 space-y-6 px-6 py-8 lg:px-8">
          {/* isi halaman (Dashboard, Barang, dll) tampil di sini */}
          <Suspense fallback={<p className="py-12 text-center text-sm text-slate-500">Memuat…</p>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
