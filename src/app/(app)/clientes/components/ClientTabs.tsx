"use client";
import { useState } from "react";
import Link from "next/link";
import type { LegalProcess } from "../../processos/types";
import { AREA_LABELS } from "../../processos/types";
import ProcessStatusBadge from "../../processos/components/StatusBadge";
import type { Task } from "../../tarefas/types";
import TaskStatusBadge from "../../tarefas/components/StatusBadge";
import PriorityBadge from "../../tarefas/components/PriorityBadge";

const TABS = [
  { key: "processos", label: "Processos", icon: "gavel", empty: "Nenhum processo vinculado ainda." },
  { key: "tarefas", label: "Tarefas", icon: "task_alt", empty: "Nenhuma tarefa vinculada ainda." },
  { key: "documentos", label: "Documentos", icon: "description", empty: "Nenhum documento vinculado ainda." },
  { key: "notas", label: "Notas", icon: "sticky_note_2", empty: "Nenhuma nota vinculada ainda." },
  { key: "historico", label: "Histórico", icon: "history", empty: "Nenhuma atividade registrada ainda." },
] as const;

export default function ClientTabs({
  clientId,
  processes,
  tasks,
}: {
  clientId: string;
  processes: LegalProcess[];
  tasks: Task[];
}) {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("processos");
  const current = TABS.find((tab) => tab.key === active)!;

  return (
    <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg">
      <div className="flex border-b border-surface-container-high overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`px-5 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
              active === tab.key
                ? "border-primary text-primary font-medium"
                : "border-transparent text-on-surface-variant hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "processos" && (
        <div className="p-5">
          <div className="flex items-center justify-end mb-4">
            <Link
              href={`/processos/novo?cliente=${clientId}`}
              className="inline-flex items-center gap-1.5 border border-surface-container-high text-primary font-label-caps text-xs px-4 py-2 rounded-sm hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              NOVO PROCESSO
            </Link>
          </div>

          {processes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
              <span className="material-symbols-outlined text-3xl text-outline">gavel</span>
              <p className="font-body-md text-on-surface-variant text-sm">Nenhum processo vinculado ainda.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {processes.map((process) => (
                <li key={process.id}>
                  <Link
                    href={`/processos/${process.id}`}
                    className="flex items-center justify-between gap-3 border border-surface-container-high rounded-md px-4 py-3 hover:bg-surface-container transition-colors"
                  >
                    <div>
                      <p className="text-primary text-sm font-medium">
                        {process.process_number || "Processo sem número"}
                      </p>
                      <p className="font-body-md text-on-surface-variant text-xs mt-0.5">
                        {AREA_LABELS[process.area]}
                      </p>
                    </div>
                    <ProcessStatusBadge status={process.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {active === "tarefas" && (
        <div className="p-5">
          <div className="flex items-center justify-end mb-4">
            <Link
              href={`/tarefas/novo?cliente=${clientId}`}
              className="inline-flex items-center gap-1.5 border border-surface-container-high text-primary font-label-caps text-xs px-4 py-2 rounded-sm hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              NOVA TAREFA
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
              <span className="material-symbols-outlined text-3xl text-outline">task_alt</span>
              <p className="font-body-md text-on-surface-variant text-sm">Nenhuma tarefa vinculada ainda.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/tarefas/${task.id}`}
                    className="flex items-center justify-between gap-3 border border-surface-container-high rounded-md px-4 py-3 hover:bg-surface-container transition-colors"
                  >
                    <div>
                      <p className="text-primary text-sm font-medium">{task.title}</p>
                      <p className="font-body-md text-on-surface-variant text-xs mt-0.5">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : "Sem prazo"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {active !== "processos" && active !== "tarefas" && (
        <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
          <span className="material-symbols-outlined text-3xl text-outline">{current.icon}</span>
          <p className="font-body-md text-on-surface-variant text-sm">{current.empty}</p>
        </div>
      )}
    </div>
  );
}
