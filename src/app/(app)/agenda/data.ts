import { supabaseAdmin } from "@/app/lib/supabase";
import type { AgendaEvent, AgendaEventWithRelations, AgendaItem, EventStatus, EventType } from "./types";
import { listTasksDueBetween } from "../tarefas/data";

export type EventListFilters = {
  search?: string;
  type?: EventType | "all";
  status?: EventStatus | "all";
  fromDate?: string;
  toDate?: string;
};

type EventRow = AgendaEvent & {
  clients: { full_name: string } | null;
  processes: { process_number: string | null } | null;
};

function toEventWithRelations(row: EventRow): AgendaEventWithRelations {
  const { clients, processes, ...event } = row;
  return {
    ...event,
    client_full_name: clients?.full_name ?? null,
    process_number: processes?.process_number ?? null,
  };
}

export async function listEvents(userId: string, filters: EventListFilters): Promise<AgendaEventWithRelations[]> {
  let query = supabaseAdmin
    .from("agenda_events")
    .select("*, clients(full_name), processes(process_number)")
    .eq("user_id", userId);

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  } else {
    query = query.neq("status", "canceled");
  }

  if (filters.search) {
    query = query.ilike("title", `%${filters.search.trim()}%`);
  }

  if (filters.fromDate) {
    query = query.gte("event_date", filters.fromDate);
  }

  if (filters.toDate) {
    query = query.lte("event_date", filters.toDate);
  }

  const { data, error } = await query
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true, nullsFirst: false });

  if (error) throw new Error("Não foi possível carregar a agenda agora.");
  return ((data ?? []) as EventRow[]).map(toEventWithRelations);
}

export async function getEvent(id: string, userId: string): Promise<AgendaEventWithRelations | null> {
  const { data } = await supabaseAdmin
    .from("agenda_events")
    .select("*, clients(full_name), processes(process_number)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  return data ? toEventWithRelations(data as EventRow) : null;
}

export async function listEventsByClient(clientId: string, userId: string): Promise<AgendaEvent[]> {
  const { data } = await supabaseAdmin
    .from("agenda_events")
    .select("*")
    .eq("client_id", clientId)
    .eq("user_id", userId)
    .order("event_date", { ascending: true });

  return (data ?? []) as AgendaEvent[];
}

export async function listEventsByProcess(processId: string, userId: string): Promise<AgendaEvent[]> {
  const { data } = await supabaseAdmin
    .from("agenda_events")
    .select("*")
    .eq("process_id", processId)
    .eq("user_id", userId)
    .order("event_date", { ascending: true });

  return (data ?? []) as AgendaEvent[];
}

export async function listUpcomingEvents(userId: string, limit: number): Promise<AgendaEventWithRelations[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabaseAdmin
    .from("agenda_events")
    .select("*, clients(full_name), processes(process_number)")
    .eq("user_id", userId)
    .eq("status", "scheduled")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true, nullsFirst: false })
    .limit(limit);

  return ((data ?? []) as EventRow[]).map(toEventWithRelations);
}

export async function getAgendaFeed(userId: string, fromDate: string, toDate: string): Promise<AgendaItem[]> {
  const [events, tasks] = await Promise.all([
    listEvents(userId, { status: "all", fromDate, toDate }),
    listTasksDueBetween(userId, fromDate, toDate),
  ]);

  const items: AgendaItem[] = [
    ...events.map((event) => ({ ...event, kind: "event" as const })),
    ...tasks.map((task) => ({
      kind: "task" as const,
      id: task.id,
      title: task.title,
      event_date: task.due_date!,
      event_time: null,
      client_full_name: task.client_full_name,
      process_number: task.process_number,
      priority: task.priority,
    })),
  ];

  items.sort((a, b) => {
    if (a.event_date !== b.event_date) return a.event_date < b.event_date ? -1 : 1;
    const at = a.kind === "event" ? a.event_time : null;
    const bt = b.kind === "event" ? b.event_time : null;
    if (at && bt) return at < bt ? -1 : at > bt ? 1 : 0;
    if (at && !bt) return -1;
    if (!at && bt) return 1;
    return 0;
  });

  return items;
}

export async function getEventStats(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { count } = await supabaseAdmin
    .from("agenda_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "scheduled")
    .eq("event_date", today);

  return { today: count ?? 0 };
}
