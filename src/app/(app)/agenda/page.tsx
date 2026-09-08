import { Suspense } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { listEvents } from "./data";
import type { AgendaItem, EventStatus, EventType } from "./types";
import { listTasksWithDueDate } from "../tarefas/data";
import AgendaToolbar from "./components/AgendaToolbar";
import TypeBadge from "./components/TypeBadge";
import StatusBadge from "./components/StatusBadge";
import PriorityBadge from "../tarefas/components/PriorityBadge";
import SuccessBanner from "../components/SuccessBanner";
import ConfirmDeleteButton from "../components/ConfirmDeleteButton";
import { deleteEvent } from "./actions";
import { deleteTask } from "../tarefas/actions";

type SearchParams = { q?: string; type?: string; status?: string; passados?: string; sucesso?: string };

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = session.user.id;
  const hasFilters = Boolean(sp.q || sp.type || sp.status);
  const includePast = sp.passados === "1";
  const today = new Date().toISOString().slice(0, 10);

  const typeFilter = sp.type === "compromisso" || sp.type === "audiencia" ? (sp.type as EventType) : "all";
  const includeEvents = !sp.type || sp.type === "all" || sp.type === "compromisso" || sp.type === "audiencia";
  const includeTasks = !sp.type || sp.type === "all" || sp.type === "prazo";
  const statusFilter = (sp.status as EventStatus | undefined) ?? "all";

  const [events, tasks] = await Promise.all([
    includeEvents
      ? listEvents(userId, {
          search: sp.q,
          type: typeFilter,
          status: statusFilter,
          fromDate: includePast ? undefined : today,
        })
      : Promise.resolve([]),
    // Prazos de tarefas não têm o mesmo conceito de status de evento; só entram quando nenhum status específico foi escolhido.
    includeTasks && statusFilter === "all"
      ? listTasksWithDueDate(userId, includePast ? undefined : today)
      : Promise.resolve([]),
  ]);

  const filteredTasks = sp.q
    ? tasks.filter((task) => task.title.toLowerCase().includes(sp.q!.toLowerCase()))
    : tasks;

  const items: AgendaItem[] = [
    ...events.map((event) => ({ ...event, kind: "event" as const })),
    ...filteredTasks.map((task) => ({
      kind: "task" as const,
      id: task.id,
      title: task.title,
      event_date: task.due_date!,
      event_time: null,
      client_full_name: task.client_full_name,
      process_number: task.process_number,
      priority: task.priority,
    })),
  ].sort((a, b) => {
    if (a.event_date !== b.event_date) return a.event_date < b.event_date ? -1 : 1;
    const at = a.kind === "event" ? a.event_time : null;
    const bt = b.kind === "event" ? b.event_time : null;
    if (at && bt) return at < bt ? -1 : at > bt ? 1 : 0;
    if (at && !bt) return -1;
    if (!at && bt) return 1;
    return 0;
  });

  return (
    <div>
      {sp.sucesso === "criado" && <SuccessBanner message="Compromisso cadastrado com sucesso." />}
      {sp.sucesso === "atualizado" && <SuccessBanner message="Compromisso atualizado com sucesso." />}

      <header className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold text-primary">Agenda</h1>
          <p className="font-body-md text-on-surface-variant text-sm max-w-xl">
            Compromissos e audiências, junto com os prazos de tarefas que estão chegando.
          </p>
        </div>
        <Link
          href="/agenda/novo"
          className="inline-flex items-center gap-1.5 bg-primary text-background font-label-caps text-xs px-6 py-3 rounded-sm hover:bg-secondary transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-base">add</span>
          NOVO COMPROMISSO
        </Link>
      </header>

      <Suspense fallback={null}>
        <AgendaToolbar />
      </Suspense>

      {items.length > 0 && (
        <p className="font-body-md text-on-surface-variant text-sm mb-3">
          {items.length} item{items.length === 1 ? "" : "s"} {hasFilters ? "encontrado" + (items.length === 1 ? "" : "s") : "na agenda"}
        </p>
      )}

      {items.length === 0 ? (
        <div className="border border-surface-container-high bg-surface-container-lowest rounded-xl py-20 px-6 flex flex-col items-center text-center gap-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-surface-container border border-surface-container-high">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">calendar_month</span>
          </div>
          <div className="space-y-1.5 max-w-sm">
            <p className="text-primary font-semibold text-lg">
              {hasFilters ? "Nada encontrado" : "Nada agendado por aqui"}
            </p>
            <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
              {hasFilters
                ? "Ajuste a busca ou os filtros para encontrar o que procura."
                : "Cadastre um compromisso ou audiência para começar a organizar sua agenda."}
            </p>
          </div>
          {!hasFilters && (
            <Link
              href="/agenda/novo"
              className="mt-2 inline-flex items-center gap-1.5 bg-primary text-background font-label-caps text-xs px-6 py-3 rounded-sm hover:bg-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              NOVO COMPROMISSO
            </Link>
          )}
        </div>
      ) : (
        <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left border-b border-surface-container-high">
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Data</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Título</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Tipo</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Cliente / Processo</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isPast = item.event_date < today;
                const detailHref = item.kind === "event" ? `/agenda/${item.id}` : `/tarefas/${item.id}`;
                const editHref = item.kind === "event" ? `/agenda/${item.id}/editar` : `/tarefas/${item.id}/editar`;
                return (
                  <tr key={`${item.kind}-${item.id}`} className="border-b border-surface-container-high/60 last:border-0 hover:bg-surface-container transition-colors">
                    <td className={`px-5 py-3 ${isPast ? "text-outline" : "text-on-surface-variant"}`}>
                      {new Date(item.event_date).toLocaleDateString("pt-BR")}
                      {item.kind === "event" && item.event_time && ` · ${item.event_time.slice(0, 5)}`}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={detailHref} className="text-primary hover:text-accent-gray transition-colors font-medium">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      {item.kind === "event" ? (
                        <TypeBadge type={item.type} />
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-container-high text-xs font-label-caps text-on-surface-variant">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#e8c56a]" />
                          Prazo de tarefa
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant">
                      {[item.client_full_name, item.process_number].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-5 py-3">
                      {item.kind === "event" ? <StatusBadge status={item.status} /> : <PriorityBadge priority={item.priority} />}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={detailHref}
                          className="text-on-surface-variant hover:text-primary transition-colors"
                          aria-label="Ver detalhes"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </Link>
                        <Link
                          href={editHref}
                          className="text-on-surface-variant hover:text-primary transition-colors"
                          aria-label="Editar"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <ConfirmDeleteButton
                          onConfirm={
                            item.kind === "event"
                              ? deleteEvent.bind(null, item.id)
                              : deleteTask.bind(null, item.id)
                          }
                          itemLabel={item.kind === "event" ? "este compromisso" : "esta tarefa"}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
