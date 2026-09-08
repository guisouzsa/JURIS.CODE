import { Suspense } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { TASKS_PAGE_SIZE, listTasks } from "./data";
import type { TaskPriority, TaskStatus } from "./types";
import TasksToolbar from "./components/TasksToolbar";
import StatusBadge from "./components/StatusBadge";
import PriorityBadge from "./components/PriorityBadge";

type SearchParams = { q?: string; status?: string; priority?: string; page?: string };

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const hasFilters = Boolean(sp.q || sp.status || sp.priority);
  const page = Number(sp.page ?? "1") || 1;

  const { tasks, total } = await listTasks(session.user.id, {
    search: sp.q,
    status: (sp.status as TaskStatus | undefined) ?? "all",
    priority: (sp.priority as TaskPriority | undefined) ?? "all",
    page,
  });

  const totalPages = Math.max(Math.ceil(total / TASKS_PAGE_SIZE), 1);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <header className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold text-primary">Tarefas</h1>
          <p className="font-body-md text-on-surface-variant text-sm max-w-xl">
            Organize suas atividades e prazos vinculados a clientes e processos.
          </p>
        </div>
        <Link
          href="/tarefas/novo"
          className="inline-flex items-center gap-1.5 bg-primary text-background font-label-caps text-xs px-6 py-3 rounded-sm hover:bg-secondary transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-base">add</span>
          NOVA TAREFA
        </Link>
      </header>

      <Suspense fallback={null}>
        <TasksToolbar />
      </Suspense>

      {tasks.length > 0 && (
        <p className="font-body-md text-on-surface-variant text-sm mb-3">
          {total} tarefa{total === 1 ? "" : "s"} {hasFilters ? "encontrada" + (total === 1 ? "" : "s") : "no total"}
        </p>
      )}

      {tasks.length === 0 ? (
        <div className="border border-surface-container-high bg-surface-container-lowest rounded-xl py-20 px-6 flex flex-col items-center text-center gap-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-surface-container border border-surface-container-high">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">task_alt</span>
          </div>
          <div className="space-y-1.5 max-w-sm">
            <p className="text-primary font-semibold text-lg">
              {hasFilters ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa cadastrada"}
            </p>
            <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
              {hasFilters
                ? "Ajuste a busca ou os filtros de status e prioridade para encontrar o que procura."
                : "Cadastre sua primeira tarefa para organizar suas atividades do dia a dia."}
            </p>
          </div>
          {!hasFilters && (
            <Link
              href="/tarefas/novo"
              className="mt-2 inline-flex items-center gap-1.5 bg-primary text-background font-label-caps text-xs px-6 py-3 rounded-sm hover:bg-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              NOVA TAREFA
            </Link>
          )}
        </div>
      ) : (
        <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left border-b border-surface-container-high">
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Título</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Cliente / Processo</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Prazo</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Prioridade</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const isOverdue = Boolean(task.due_date && task.due_date < today && task.status !== "done" && task.status !== "canceled");
                return (
                  <tr key={task.id} className="border-b border-surface-container-high/60 last:border-0 hover:bg-surface-container transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/tarefas/${task.id}`} className="text-primary hover:text-accent-gray transition-colors font-medium">
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant">
                      {task.client_full_name || task.process_number
                        ? [task.client_full_name, task.process_number].filter(Boolean).join(" · ")
                        : "—"}
                    </td>
                    <td className={`px-5 py-3 ${isOverdue ? "text-error" : "text-on-surface-variant"}`}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/tarefas/${task.id}`}
                          className="text-on-surface-variant hover:text-primary transition-colors"
                          aria-label="Ver detalhes"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </Link>
                        <Link
                          href={`/tarefas/${task.id}/editar`}
                          className="text-on-surface-variant hover:text-primary transition-colors"
                          aria-label="Editar"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-on-surface-variant">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <PageLink page={page - 1} disabled={page <= 1} searchParams={sp} label="Anterior" />
            <PageLink page={page + 1} disabled={page >= totalPages} searchParams={sp} label="Próxima" />
          </div>
        </div>
      )}
    </div>
  );
}

function PageLink({
  page,
  disabled,
  searchParams,
  label,
}: {
  page: number;
  disabled: boolean;
  searchParams: SearchParams;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="border border-surface-container-high text-outline text-xs font-label-caps px-4 py-2 rounded-sm opacity-50">
        {label.toUpperCase()}
      </span>
    );
  }

  const params = new URLSearchParams();
  if (searchParams.q) params.set("q", searchParams.q);
  if (searchParams.status) params.set("status", searchParams.status);
  if (searchParams.priority) params.set("priority", searchParams.priority);
  params.set("page", String(page));

  return (
    <Link
      href={`/tarefas?${params.toString()}`}
      className="border border-surface-container-high text-primary text-xs font-label-caps px-4 py-2 rounded-sm hover:bg-surface-container transition-colors"
    >
      {label.toUpperCase()}
    </Link>
  );
}
