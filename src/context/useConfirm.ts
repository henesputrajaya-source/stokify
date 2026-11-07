import { useContext } from "react";
import { ConfirmContext } from "./ConfirmContext";

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm harus dipakai di dalam <ConfirmProvider>");
  return ctx;
}
