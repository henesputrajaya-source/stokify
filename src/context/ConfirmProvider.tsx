import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { ConfirmContext } from "./ConfirmContext";
import type { Konfirmasi, OpsiKonfirmasi } from "./ConfirmContext";

export default function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opsi, setOpsi] = useState<OpsiKonfirmasi | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const konfirmasi: Konfirmasi = useCallback((o) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setOpsi(o);
    });
  }, []);

  function tutup(hasil: boolean) {
    resolver.current?.(hasil);
    resolver.current = null;
    setOpsi(null);
  }

  // Escape = batal
  useEffect(() => {
    if (!opsi) return;
    const tombol = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        resolver.current?.(false);
        resolver.current = null;
        setOpsi(null);
      }
    };
    document.addEventListener("keydown", tombol);
    return () => document.removeEventListener("keydown", tombol);
  }, [opsi]);

  return (
    <ConfirmContext.Provider value={konfirmasi}>
      {children}

      {opsi && (
        <div
          className="fixed inset-0 z-[60] flex overflow-y-auto bg-slate-900/50 p-4"
          onClick={() => tutup(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="konfirmasi-judul"
            aria-describedby="konfirmasi-pesan"
            onClick={(e) => e.stopPropagation()}
            className="m-auto w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  opsi.bahaya
                    ? "bg-red-50 text-red-500 dark:bg-red-500/10"
                    : "bg-violet-50 text-violet-600 dark:bg-violet-500/20"
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 id="konfirmasi-judul" className="font-semibold text-slate-900 dark:text-white">
                  {opsi.judul}
                </h2>
                <p id="konfirmasi-pesan" className="mt-1 text-sm text-slate-500">
                  {opsi.pesan}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                autoFocus
                onClick={() => tutup(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={() => tutup(true)}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium text-white ${
                  opsi.bahaya ? "bg-red-500 hover:bg-red-600" : "bg-violet-600 hover:bg-violet-700"
                }`}
              >
                {opsi.labelYa ?? "Ya, lanjut"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
