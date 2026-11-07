import { useContext } from "react";
import { TransaksiContext } from "./TransaksiContext";

export function useTransaksi() {
  const ctx = useContext(TransaksiContext);
  if (!ctx) throw new Error("useTransaksi harus dipakai di dalam <TransaksiProvider>");
  return ctx;
}
