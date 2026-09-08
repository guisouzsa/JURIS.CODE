import { supabaseAdmin } from "@/app/lib/supabase";
import type { Client, ClientStatus } from "./types";

export type ClientListFilters = {
  search?: string;
  status?: ClientStatus | "all";
  personType?: "individual" | "company" | "all";
  page?: number;
  orderBy?: "recent" | "name";
};

export const CLIENTS_PAGE_SIZE = 20;

export async function listClients(userId: string, filters: ClientListFilters) {
  let query = supabaseAdmin.from("clients").select("*", { count: "exact" }).eq("user_id", userId);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  } else {
    // Sem filtro explícito, a listagem padrão esconde inativos (mas mostra prospect/ex-cliente).
    query = query.neq("status", "inactive");
  }

  if (filters.personType && filters.personType !== "all") {
    query = query.eq("person_type", filters.personType);
  }

  if (filters.search) {
    const term = filters.search.trim();
    const digits = term.replace(/\D/g, "");
    const orParts = [`full_name.ilike.%${term}%`, `email.ilike.%${term}%`];
    if (digits) orParts.push(`document_number.ilike.%${digits}%`, `phone.ilike.%${digits}%`);
    query = query.or(orParts.join(","));
  }

  const page = Math.max(filters.page ?? 1, 1);
  const from = (page - 1) * CLIENTS_PAGE_SIZE;
  const to = from + CLIENTS_PAGE_SIZE - 1;

  query =
    filters.orderBy === "name"
      ? query.order("full_name", { ascending: true })
      : query.order("created_at", { ascending: false });

  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error("Não foi possível carregar os clientes agora.");
  return { clients: (data ?? []) as Client[], total: count ?? 0, page };
}

export async function getClient(id: string, userId: string): Promise<Client | null> {
  const { data } = await supabaseAdmin
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  return (data as Client | null) ?? null;
}

export async function listClientOptions(userId: string): Promise<Pick<Client, "id" | "full_name">[]> {
  const { data } = await supabaseAdmin
    .from("clients")
    .select("id, full_name")
    .eq("user_id", userId)
    .neq("status", "inactive")
    .order("full_name", { ascending: true });

  return data ?? [];
}

export async function listRecentClients(
  userId: string,
  limit: number
): Promise<Pick<Client, "id" | "full_name" | "status" | "created_at">[]> {
  const { data } = await supabaseAdmin
    .from("clients")
    .select("id, full_name, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

const CLIENT_STATUSES: ClientStatus[] = ["active", "inactive", "prospect", "former"];

export async function getClientStatusBreakdown(userId: string): Promise<Record<ClientStatus, number>> {
  const results = await Promise.all(
    CLIENT_STATUSES.map((status) =>
      supabaseAdmin.from("clients").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", status)
    )
  );
  return CLIENT_STATUSES.reduce((acc, status, i) => {
    acc[status] = results[i].count ?? 0;
    return acc;
  }, {} as Record<ClientStatus, number>);
}

export async function getClientStats(userId: string) {
  const [activeRes, totalRes] = await Promise.all([
    supabaseAdmin.from("clients").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
    supabaseAdmin.from("clients").select("*", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  return {
    active: activeRes.count ?? 0,
    total: totalRes.count ?? 0,
  };
}
