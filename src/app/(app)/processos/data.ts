import { supabaseAdmin } from "@/app/lib/supabase";
import type { LegalProcess, ProcessArea, ProcessStatus, ProcessWithClient } from "./types";

export type ProcessListFilters = {
  search?: string;
  status?: ProcessStatus | "all";
  area?: ProcessArea | "all";
  page?: number;
};

export const PROCESSES_PAGE_SIZE = 20;

type ProcessRow = LegalProcess & { clients: { full_name: string } | null };

function toProcessWithClient(row: ProcessRow): ProcessWithClient {
  const { clients, ...process } = row;
  return { ...process, client_full_name: clients?.full_name ?? "—" };
}

export async function listProcesses(userId: string, filters: ProcessListFilters) {
  let query = supabaseAdmin
    .from("processes")
    .select("*, clients(full_name)", { count: "exact" })
    .eq("user_id", userId);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  } else {
    // Sem filtro explícito, a listagem padrão esconde arquivados.
    query = query.neq("status", "archived");
  }

  if (filters.area && filters.area !== "all") {
    query = query.eq("area", filters.area);
  }

  if (filters.search) {
    const term = filters.search.trim();
    query = query.or(
      [`process_number.ilike.%${term}%`, `subject.ilike.%${term}%`, `opposing_party.ilike.%${term}%`].join(",")
    );
  }

  const page = Math.max(filters.page ?? 1, 1);
  const from = (page - 1) * PROCESSES_PAGE_SIZE;
  const to = from + PROCESSES_PAGE_SIZE - 1;

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) throw new Error("Não foi possível carregar os processos agora.");
  return { processes: ((data ?? []) as ProcessRow[]).map(toProcessWithClient), total: count ?? 0, page };
}

export async function getProcess(id: string, userId: string): Promise<ProcessWithClient | null> {
  const { data } = await supabaseAdmin
    .from("processes")
    .select("*, clients(full_name)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  return data ? toProcessWithClient(data as ProcessRow) : null;
}

export async function listProcessesByClient(clientId: string, userId: string): Promise<LegalProcess[]> {
  const { data } = await supabaseAdmin
    .from("processes")
    .select("*")
    .eq("client_id", clientId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []) as LegalProcess[];
}

export async function listRecentProcesses(userId: string, limit: number): Promise<ProcessWithClient[]> {
  const { data } = await supabaseAdmin
    .from("processes")
    .select("*, clients(full_name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as ProcessRow[]).map(toProcessWithClient);
}

export async function listProcessOptions(userId: string): Promise<ProcessWithClient[]> {
  const { data } = await supabaseAdmin
    .from("processes")
    .select("*, clients(full_name)")
    .eq("user_id", userId)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  return ((data ?? []) as ProcessRow[]).map(toProcessWithClient);
}

export async function getProcessStats(userId: string) {
  const [activeRes, concludedRes, totalRes] = await Promise.all([
    supabaseAdmin.from("processes").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
    supabaseAdmin.from("processes").select("*", { count: "exact", head: true }).eq("user_id", userId).in("status", ["won", "lost", "archived"]),
    supabaseAdmin.from("processes").select("*", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  return {
    active: activeRes.count ?? 0,
    concluded: concludedRes.count ?? 0,
    total: totalRes.count ?? 0,
  };
}
