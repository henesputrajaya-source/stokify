import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import type { User } from "../api/users";

// data yang dikirim ke backend
export type PenggunaFormData = {
  name: string;
  email: string;
  password?: string; // hanya dikirim saat tambah pengguna
};

interface PenggunaFormModalProps {
  // null = tambah pengguna baru
  pengguna: User | null;
  // mengembalikan pesan error, atau null jika berhasil (modal ditutup oleh pemanggil)
  onSave: (data: PenggunaFormData) => Promise<string | null>;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:ring-violet-500/20";

export default function PenggunaFormModal({ pengguna, onSave, onClose }: PenggunaFormModalProps) {
  const [name, setName] = useState(pengguna?.name ?? "");
  const [email, setEmail] = useState(pengguna?.email ?? "");
  const [password, setPassword] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);

  // Escape = tutup
  useEffect(() => {
    const tombol = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", tombol);
    return () => document.removeEventListener("keydown", tombol);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMenyimpan(true);
    setGalat(null);
    try {
      const data: PenggunaFormData = { name: name.trim(), email: email.trim() };
      // password hanya untuk pengguna baru (backend: PATCH tidak menerima password)
      if (!pengguna) data.password = password;
      const hasil = await onSave(data);
      // jika berhasil, pemanggil menutup modal; jika gagal, tampilkan pesannya
      if (hasil) setGalat(hasil);
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setMenyimpan(false);
    }
  }

  const judul = pengguna ? "Ubah Pengguna" : "Tambah Pengguna";

  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-900/50 p-4" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-pengguna-judul"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="m-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="form-pengguna-judul" className="text-lg font-semibold text-slate-900 dark:text-white">
              {judul}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {pengguna ? "Perbarui data pengguna ini." : "Isi data pengguna baru."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Nama lengkap</span>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Alamat email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@contoh.com"
              className={inputClass}
            />
          </label>

          {!pengguna && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                className={inputClass}
              />
            </label>
          )}
        </div>

        {galat && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-500 dark:bg-red-500/10">
            {galat}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={menyimpan}
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {menyimpan ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
