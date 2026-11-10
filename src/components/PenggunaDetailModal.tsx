import { useEffect } from "react";
import { X, Mail, CalendarDays, Pencil } from "lucide-react";
import PenggunaAvatar from "./PenggunaAvatar";
import { tanggal } from "../data/pengguna";
import type { User } from "../api/users";

interface PenggunaDetailModalProps {
  pengguna: User;
  onEdit: () => void;
  onClose: () => void;
}

export default function PenggunaDetailModal({ pengguna, onEdit, onClose }: PenggunaDetailModalProps) {
  useEffect(() => {
    const tombol = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", tombol);
    return () => document.removeEventListener("keydown", tombol);
  }, [onClose]);

  const baris = [
    { ikon: Mail, label: "Email", isi: pengguna.email },
    { ikon: CalendarDays, label: "Dibuat pada", isi: tanggal(pengguna.createdAt) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-900/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-pengguna-judul"
        onClick={(e) => e.stopPropagation()}
        className="m-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <PenggunaAvatar id={pengguna.id} nama={pengguna.name} className="h-14 w-14 text-lg" />
            <div>
              <h2
                id="detail-pengguna-judul"
                className="text-lg font-semibold capitalize text-slate-900 dark:text-white"
              >
                {pengguna.name}
              </h2>
              <p className="text-sm text-slate-500">{pengguna.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <dl className="divide-y divide-slate-100 rounded-xl border border-slate-100 dark:divide-slate-700 dark:border-slate-700">
          {baris.map(({ ikon: Ikon, label, isi }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <Ikon className="h-4 w-4 shrink-0 text-slate-400" />
              <dt className="w-24 shrink-0 text-xs text-slate-500">{label}</dt>
              <dd className="min-w-0 flex-1 break-words text-sm font-medium text-slate-800 dark:text-slate-100">{isi}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Tutup
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
          >
            <Pencil className="h-4 w-4" />
            Ubah
          </button>
        </div>
      </div>
    </div>
  );
}
