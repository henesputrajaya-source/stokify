import { useContext } from "react";
import { BarangContext } from "./BarangContext";

export function useBarang() {
  const ctx = useContext(BarangContext);
  if (!ctx) throw new Error("useBarang harus dipakai di dalam <BarangProvider>");
  return ctx;
}
