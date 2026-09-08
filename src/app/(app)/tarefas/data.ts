import { supabaseAdmin } from "@/app/lib/supabase";
import type { Task, TaskPriority, TaskStatus, TaskWithRelations } from "./types";

export type TaskListFilters = {
  search?: string;
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  page?: number;
};

export const TASKS_PAGE_SIZE = 20;

type TaskRow = Task & {
  clients: { full_name: string } | null;
  processes: { process_number: string | null } | null;
};

function toTaskWithRelations(row: TaskRow): TaskWithRelations {
  const { clients, processes, ...task } = row;
  return {
    ...task,
    client_full_name: clients?.full_name ?? null,
    process_number: processes?.process_number ?? null,
  };
}

export async function listTasks(userId: string, filters: TaskListFilters) {
  let query = supabaseAdmin
    .from("tasks")
    .select("*, clients(full_name), processes(process_number)", { count: "exact" })
    .eq("user_id", userId);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  } else {
    // Sem filtro explícito, a listagem padrão esconde concluídas e canceladas.
    query = query.not("status", "in", "(done,canceled)");
  }

  if (filters.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }

  if (filters.search) {
    const term = filters.search.trim();
    query = query.ilike("title", `%${term}%`);
  }

  const page = Math.max(filters.page ?? 1, 1);
  const from = (page - 1) * TASKS_PAGE_SIZE;
  const to = from + TASKS_PAGE_SIZE - 1;

  const { data, error, count } = await query
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error("Não foi possível carregar as tarefas agora.");
  return { tasks: ((data ?? []) as TaskRow[]).map(toTaskWithRelations), total: count ?? 0, page };
}

export async function getTask(id: string, userId: string): Promise<TaskWithRelations | null> {
  const { data } = await supabaseAdmin
    .from("tasks")
    .select("*, clients(full_name), processes(process_number)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  return data ? toTaskWithRelations(data as TaskRow) : null;
}

export async function listTasksByClient(clientId: string, userId: string): Promise<Task[]> {
  const { data } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .eq("client_id", clientId)
    .eq("user_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false });

  return (data ?? []) as Task[];
}

export async function listTasksByProcess(processId: string, userId: string): Promise<Task[]> {
  const { data } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .eq("process_id", processId)
    .eq("user_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false });

  return (data ?? []) as Task[];
}

export async function listTasksDueBetween(
  userId: string,
  fromDate: string,
  toDate: string
): Promise<TaskWithRelations[]> {
  const { data } = await supabaseAdmin
    .from("tasks")
    .select("*, clients(full_name), processes(process_number)")
    .eq("user_id", userId)
    .not("status", "in", "(done,canceled)")
    .gte("due_date", fromDate)
    .lte("due_date", toDate)
    .order("due_date", { ascending: true });

  return ((data ?? []) as TaskRow[]).map(toTaskWithRelations);
}

export async function listTasksWithDueDate(userId: string, fromDate?: string): Promise<TaskWithRelations[]> {
  let query = supabaseAdmin
    .from("tasks")
    .select("*, clients(full_name), processes(process_number)")
    .eq("user_id", userId)
    .not("due_date", "is", null)
    .not("status", "in", "(done,canceled)");

  if (fromDate) query = query.gte("due_date", fromDate);

  const { data } = await query.order("due_date", { ascending: true });
  return ((data ?? []) as TaskRow[]).map(toTaskWithRelations);
}

const TASK_STATUSES: TaskStatus[] = ["pending", "in_progress", "done", "canceled"];
const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

export async function getTaskBreakdown(
  userId: string,
  by: "status" | "priority"
): Promise<Record<string, number>> {
  const values: string[] = by === "status" ? TASK_STATUSES : TASK_PRIORITIES;
  const results = await Promise.all(
    values.map((value) =>
      supabaseAdmin.from("tasks").select("*", { count: "exact", head: true }).eq("user_id", userId).eq(by, value)
    )
  );
  return values.reduce((acc, value, i) => {
    acc[value] = results[i].count ?? 0;
    return acc;
  }, {} as Record<string, number>);
}

export async function getTaskStats(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const [pendingRes, overdueRes] = await Promise.all([
    supabaseAdmin.from("tasks").select("*", { count: "exact", head: true }).eq("user_id", userId).in("status", ["pending", "in_progress"]),
    supabaseAdmin.from("tasks").select("*", { count: "exact", head: true }).eq("user_id", userId).in("status", ["pending", "in_progress"]).lt("due_date", today),
  ]);

  return {
    pending: pendingRes.count ?? 0,
    overdue: overdueRes.count ?? 0,
  };
}
