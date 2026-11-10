const BASE_URL = "http://localhost:3000/api/v1";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: User[];
  pagination: Pagination;
}

export async function fetchUsers(
  params: { page: number; limit: number; search?: string },
  signal?: AbortSignal,
): Promise<UsersResponse> {
  const qs = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.search) qs.set("search", params.search);

  const res = await fetch(`${BASE_URL}/users?${qs}`, { signal });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? "Gagal memuat data pengguna.");
  }
  return json as UsersResponse;
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message ?? "Gagal menghapus pengguna.");
  }
}

// backend: POST /users/register (name, email, password wajib)
export async function createUser(data: Record<string, unknown>): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.ok) return null;
  const json = await res.json().catch(() => null);
  return json?.message ?? "Gagal menambah pengguna.";
}

// backend: PATCH /users/:id (name dan/atau email)
export async function updateUser(id: string, data: Record<string, unknown>): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (res.ok) return null;
  const json = await res.json().catch(() => null);
  return json?.message ?? "Gagal mengubah pengguna.";
}
