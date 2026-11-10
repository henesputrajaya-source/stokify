// tipe dan data awal untuk menu Pengguna

export const ROLE = ["Admin", "Operator", "User"] as const;
export type RolePengguna = (typeof ROLE)[number];

export interface Pengguna {
  id: number;
  nama: string;
  email: string;
  role: RolePengguna;
  // waktu dibuat, format ISO
  dibuat: string;
}

export type PenggunaInput = Pick<Pengguna, "nama" | "email" | "role">;

// "30 Okt 2026"
export function tanggal(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

// "Tedi Saputra" -> "TS"
export function inisial(nama: string): string {
  const kata = nama.trim().split(/\s+/).filter(Boolean);
  if (kata.length === 0) return "?";
  const awal = kata[0][0] + (kata.length > 1 ? kata[1][0] : "");
  return awal.toUpperCase();
}

const NAMA: [string, RolePengguna][] = [
  ["John Doe", "Admin"],
  ["Aisyah Salsabila", "Operator"],
  ["Muhammad Ridwan", "Operator"],
  ["Nurul Fadilah", "User"],
  ["Ahmad Hidayat", "User"],
  ["Siti Rahmawati", "User"],
  ["Budi Santoso", "Operator"],
  ["Dewi Lestari", "User"],
  ["Rizky Pratama", "User"],
  ["Putri Ayu Ningrum", "Operator"],
  ["Agus Setiawan", "User"],
  ["Fitri Handayani", "User"],
  ["Hendra Wijaya", "Operator"],
  ["Lina Marlina", "User"],
  ["Yusuf Maulana", "User"],
  ["Rina Kartika", "Operator"],
  ["Dimas Anggara", "User"],
  ["Maya Sari", "User"],
  ["Eko Prasetyo", "Operator"],
  ["Nadia Putri", "User"],
  ["Fajar Nugroho", "User"],
  ["Wulan Dari", "Operator"],
  ["Andi Kurniawan", "User"],
  ["Citra Dewanti", "User"],
  ["Bayu Saputra", "Operator"],
  ["Intan Permata", "User"],
  ["Rahmat Hakim", "User"],
  ["Sri Wahyuni", "Operator"],
  ["Galih Ramadhan", "User"],
  ["Anisa Fauziah", "User"],
  ["Taufik Hidayah", "Operator"],
  ["Laila Nur Hasanah", "User"],
  ["Reza Firmansyah", "User"],
  ["Mega Silviana", "Operator"],
  ["Irfan Maulidi", "User"],
  ["Ratna Juwita", "User"],
  ["Joko Susilo", "Operator"],
  ["Tiara Anggraini", "User"],
  ["Hasan Basri", "User"],
  ["Novi Yanti", "Operator"],
  ["Ilham Syahputra", "User"],
  ["Dian Pertiwi", "User"],
];

// tanggal pembuatan: lima pertama sesuai desain, sisanya mundur tiap 1-2 hari
const HARI_AWAL = [30, 28, 25, 20, 18];

export function buatDataAwal(): Pengguna[] {
  let hari = 17;
  return NAMA.map(([nama, role], i) => {
    const tgl = i < HARI_AWAL.length ? HARI_AWAL[i] : (hari -= i % 2 === 0 ? 1 : 2);
    const kata = nama.toLowerCase().split(" ");
    return {
      id: i + 1,
      nama,
      email: `${kata[0]}.${kata[kata.length - 1]}@stokify.id`,
      role,
      dibuat: new Date(2026, 9, tgl, 9, 0).toISOString(),
    };
  });
}
