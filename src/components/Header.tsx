import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, AlertTriangle, CheckCircle2, Menu } from "lucide-react";
import { useBarang } from "../context/useBarang";
import { useSettings } from "../context/useSettings";

// "Tedi Saputra" -> "TS"
function inisial(nama: string): string {
  const huruf = nama.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((k) => k[0].toUpperCase()).join("");
  return huruf || "?";
}

export default function Header({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate();
  const { items } = useBarang();
  const { pengaturan } = useSettings();
  const [query, setQuery] = useState("");
  const [bukaNotif, setBukaNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const menipis = items.filter((b) => b.stok <= pengaturan.batasMenipis).sort((a, b) => a.stok - b.stok);

  // tutup dropdown saat klik di luar
  useEffect(() => {
    function klikLuar(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setBukaNotif(false);
    }
    document.addEventListener("mousedown", klikLuar);
    return () => document.removeEventListener("mousedown", klikLuar);
  }, []);

  function handleCari(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/barang?q=${encodeURIComponent(q)}` : "/barang");
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white/70 px-4 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900/70 lg:px-8">
      <button
        onClick={onMenu}
        aria-label="Buka menu"
        className="shrink-0 rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <form onSubmit={handleCari} className="relative w-full max-w-xl min-w-0">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari barang, kategori, atau SKU..."
          className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-violet-500/20"
        />
      </form>

      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setBukaNotif((v) => !v)}
            className="relative text-slate-800 dark:text-slate-200"
            aria-label="Notifikasi"
            aria-expanded={bukaNotif}
          >
            <Bell className="h-5 w-5" />
            {menipis.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" />
            )}
          </button>

          {bukaNotif && (
            <div className="absolute right-0 top-9 z-30 w-72 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
              <p className="px-2 pb-2 text-sm font-semibold text-slate-900 dark:text-white">Notifikasi</p>
              {menipis.length === 0 ? (
                <p className="flex items-center gap-2 px-2 py-3 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Semua stok aman.
                </p>
              ) : (
                <ul className="max-h-64 space-y-1 overflow-y-auto">
                  {menipis.map((b) => (
                    <li key={b.id}>
                      <Link
                        to={`/barang?q=${encodeURIComponent(b.nama)}`}
                        onClick={() => setBukaNotif(false)}
                        className="flex items-start gap-2 rounded-xl px-2 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                        <span className="text-slate-700 dark:text-slate-200">
                          <span className="font-semibold">{b.nama}</span> hampir habis, sisa {b.stok} {b.satuan}.
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">
            {inisial(pengaturan.namaUser)}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{pengaturan.namaUser}</p>
            <p className="text-xs text-slate-500">{pengaturan.role}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </header>
  );
}
