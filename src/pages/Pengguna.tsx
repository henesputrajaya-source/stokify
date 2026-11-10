import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Mail,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  UserX,
  X,
  Loader2,
} from "lucide-react";
import PenggunaAvatar from "../components/PenggunaAvatar";
import PenggunaFormModal from "../components/PenggunaFormModal";
import PenggunaDetailModal from "../components/PenggunaDetailModal";
import { useConfirm } from "../context/useConfirm";
import { tanggal } from "../data/pengguna";
import { fetchUsers, deleteUser, createUser, updateUser } from "../api/users";
import type { User, Pagination } from "../api/users";

const PILIHAN_PER_HALAMAN = [5, 10, 20];

// nomor halaman yang ditampilkan: maksimal 5, bergeser mengikuti halaman aktif
function nomorHalaman(total: number, aktif: number): number[] {
  const jumlah = Math.min(5, total);
  const awal = Math.max(1, Math.min(aktif - 2, total - jumlah + 1));
  return Array.from({ length: jumlah }, (_, i) => awal + i);
}

export default function Pengguna() {
  const konfirmasi = useConfirm();

  // pencarian, halaman, dan limit disimpan di URL
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const halaman = Math.max(1, Number(params.get("page")) || 1);
  const perHalaman = PILIHAN_PER_HALAMAN.includes(Number(params.get("limit")))
    ? Number(params.get("limit"))
    : 5;

  const [items, setItems] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // input pencarian lokal (debounce) agar tidak request di setiap ketikan
  const [cari, setCari] = useState(query);

  // null = tertutup; { editing: null } = tambah; { editing: user } = ubah
  const [modal, setModal] = useState<{ editing: User | null } | null>(null);
  const [detail, setDetail] = useState<User | null>(null);

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params);
      for (const [k, v] of Object.entries(patch)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  // debounce pencarian -> URL
  useEffect(() => {
    if (cari.trim() === query) return;
    const t = setTimeout(() => {
      updateParams({ q: cari.trim() || null, page: null });
    }, 400);
    return () => clearTimeout(t);
  }, [cari, query, updateParams]);

  // ambil data dari backend
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchUsers({ page: halaman, limit: perHalaman, search: query.trim() }, controller.signal)
      .then((res) => {
        setItems(res.data);
        setPagination(res.pagination);
        setGalat(null);
        // halaman melebihi total (mis. setelah hapus data terakhir di halaman ini)
        if (res.data.length === 0 && res.pagination.totalPages > 0 && halaman > res.pagination.totalPages) {
          updateParams({ page: String(res.pagination.totalPages) });
        }
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setGalat(e instanceof Error ? e.message : "Terjadi kesalahan.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [halaman, perHalaman, query, reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalItems = pagination?.totalItems ?? 0;
  const totalHalaman = Math.max(1, pagination?.totalPages ?? 1);
  const aktif = Math.min(halaman, totalHalaman);
  const mulai = (aktif - 1) * perHalaman;

  function gotoPage(n: number) {
    updateParams({ page: n > 1 ? String(n) : null });
  }

  async function handleSave(data: Record<string, unknown>): Promise<string | null> {
    const editing = modal?.editing;
    const hasil = editing ? await updateUser(editing.id, data) : await createUser(data);
    if (hasil) return hasil;
    if (!editing) {
      setCari("");
      updateParams({ q: null, page: null });
    }
    setReloadKey((k) => k + 1);
    setModal(null);
    return null;
  }

  async function handleDelete(p: User) {
    const ya = await konfirmasi({
      judul: "Hapus pengguna?",
      pesan: `"${p.name}" akan dihapus dari daftar pengguna.`,
      labelYa: "Hapus",
      bahaya: true,
    });
    if (!ya) return;
    try {
      await deleteUser(p.id);
      setGalat(null);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setGalat(e instanceof Error ? e.message : "Gagal menghapus pengguna.");
    }
  }

  const tombolAksi = "rounded-lg p-2 transition";

  return (
    <>
      {/* Judul */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pengguna</h1>
        <p className="mt-2 text-sm text-slate-500">Kelola dan atur pengguna aplikasi.</p>
      </div>

      {galat && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500 dark:bg-red-500/10"
        >
          <p>{galat}</p>
          <button onClick={() => setGalat(null)} aria-label="Tutup pesan" className="shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Kartu tabel */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
        {/* Judul kartu + pencarian + tombol tambah */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Semua Pengguna</h2>
            <p className="mt-1 text-sm text-slate-500">Daftar pengguna yang terdaftar di aplikasi</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-64">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari nama atau email..."
                aria-label="Cari pengguna"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:ring-violet-500/20"
              />
            </div>
            <button
              onClick={() => setModal({ editing: null })}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700"
            >
              <Plus className="h-4 w-4" />
              Tambah Pengguna
            </button>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-700/50">
                <th className="rounded-l-xl px-4 py-3 font-medium">No.</th>
                <th className="px-4 py-3 font-medium">Pengguna</th>
                <th className="px-4 py-3 font-medium">Alamat Email</th>
                <th className="px-4 py-3 font-medium">Dibuat</th>
                <th className="rounded-r-xl px-4 py-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y divide-slate-100 transition-opacity dark:divide-slate-700 ${
                loading ? "opacity-50" : ""
              }`}
            >
              {items.map((p, i) => (
                <tr key={p.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-700/40">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{mulai + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <PenggunaAvatar id={p.id} nama={p.name} />
                      <p className="font-semibold capitalize text-slate-900 dark:text-white">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                      {p.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                      {tanggal(p.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setDetail(p)}
                        aria-label={`Lihat ${p.name}`}
                        className={`${tombolAksi} bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setModal({ editing: p })}
                        aria-label={`Ubah ${p.name}`}
                        className={`${tombolAksi} bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-500/10 dark:hover:bg-violet-500/20`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        aria-label={`Hapus ${p.name}`}
                        className={`${tombolAksi} bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && items.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Memuat data...</p>
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-slate-500">
              <UserX className="h-10 w-10" />
              <p className="text-sm">Tidak ada pengguna yang cocok.</p>
            </div>
          )}
        </div>

        {/* Footer: info, jumlah per halaman, paginasi */}
        <div className="mt-4 flex flex-col gap-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>
            {totalItems === 0
              ? "Menampilkan 0 pengguna"
              : `Menampilkan ${mulai + 1}–${mulai + items.length} dari ${totalItems} pengguna`}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={perHalaman}
              onChange={(e) => updateParams({ limit: e.target.value, page: null })}
              aria-label="Jumlah per halaman"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              {PILIHAN_PER_HALAMAN.map((n) => (
                <option key={n} value={n}>
                  {n} per halaman
                </option>
              ))}
            </select>

            <nav aria-label="Halaman" className="flex items-center gap-1">
              <button
                onClick={() => gotoPage(aktif - 1)}
                disabled={!pagination?.hasPreviousPage}
                aria-label="Halaman sebelumnya"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-600 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {nomorHalaman(totalHalaman, aktif).map((n) => (
                <button
                  key={n}
                  onClick={() => gotoPage(n)}
                  aria-current={n === aktif ? "page" : undefined}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                    n === aktif
                      ? "bg-violet-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => gotoPage(aktif + 1)}
                disabled={!pagination?.hasNextPage}
                aria-label="Halaman berikutnya"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-600 dark:hover:bg-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </section>

      {/* Modal tambah / ubah */}
      {modal && (
        <PenggunaFormModal pengguna={modal.editing} onSave={handleSave} onClose={() => setModal(null)} />
      )}

      {/* Modal detail */}
      {detail && (
        <PenggunaDetailModal
          pengguna={detail}
          onEdit={() => {
            setModal({ editing: detail });
            setDetail(null);
          }}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}