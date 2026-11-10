import { NavLink } from "react-router-dom";
import {
  Home,
  Package,
  ArrowLeftRight,
  FileText,
  Users,
  Settings,
  Moon,
  BarChart3,
  ChevronRight,
  X,
} from "lucide-react";

const menu = [
  { label: "Beranda", to: "/", icon: Home },
  { label: "Barang", to: "/barang", icon: Package },
  { label: "Transaksi", to: "/transaksi", icon: ArrowLeftRight, arrow: true },
  { label: "Laporan", to: "/laporan", icon: FileText },
  { label: "Pengguna", to: "/pengguna", icon: Users },
  { label: "Pengaturan", to: "/pengaturan", icon: Settings },
];

interface SidebarProps {
  dark: boolean;
  setDark: (v: boolean) => void;
  // drawer di layar kecil; di layar lebar (lg) sidebar selalu tampil
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ dark, setDark, open, onClose }: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[235px] shrink-0 flex-col justify-between overflow-y-auto border-r border-slate-100 bg-white px-4 py-6 transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:static lg:z-auto lg:translate-x-0 lg:bg-slate-50/60 ${
        open ? "translate-x-0" : "max-lg:invisible max-lg:-translate-x-full"
      }`}
    >
      <div>
        <div className="mb-8 flex items-center justify-between gap-2 px-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-violet-600" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">Stokify</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup menu"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1">
          {menu.map(({ label, to, icon: Icon, arrow }) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{label}</span>
              {arrow && <ChevronRight className="h-4 w-4 text-slate-400" />}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center justify-between px-3 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          <span>Mode Gelap</span>
        </div>
        <button
          onClick={() => setDark(!dark)}
          aria-label="Toggle mode gelap"
          className={`relative h-6 w-11 rounded-full transition ${dark ? "bg-violet-600" : "bg-slate-200"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
              dark ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </aside>
  );
}
