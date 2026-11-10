import { useContext } from "react";
import { PenggunaContext } from "./PenggunaContext";

export function usePengguna() {
  const ctx = useContext(PenggunaContext);
  if (!ctx) throw new Error("usePengguna harus dipakai di dalam <PenggunaProvider>");
  return ctx;
}
