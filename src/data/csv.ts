// Unduh data sebagai file CSV. BOM (\uFEFF) di depan supaya Excel membaca UTF-8 dengan benar.
function escapeSel(v: string | number): string {
  const teks = String(v);
  return /[",\n]/.test(teks) ? `"${teks.replace(/"/g, '""')}"` : teks;
}

export function unduhCsv(namaFile: string, baris: (string | number)[][]) {
  const isi = "\uFEFF" + baris.map((r) => r.map(escapeSel).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([isi], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = namaFile;
  a.click();
  URL.revokeObjectURL(url);
}
