"use client";
import { useState } from "react";

const TABS = [
  { key: "processos", label: "Processos", icon: "gavel", empty: "Nenhum processo vinculado ainda." },
  { key: "tarefas", label: "Tarefas", icon: "task_alt", empty: "Nenhuma tarefa vinculada ainda." },
  { key: "documentos", label: "Documentos", icon: "description", empty: "Nenhum documento vinculado ainda." },
  { key: "notas", label: "Notas", icon: "sticky_note_2", empty: "Nenhuma nota vinculada ainda." },
  { key: "historico", label: "Histórico", icon: "history", empty: "Nenhuma atividade registrada ainda." },
] as const;

export default function ClientTabs() {
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

      <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
        <span className="material-symbols-outlined text-3xl text-outline">{current.icon}</span>
        <p className="font-body-md text-on-surface-variant text-sm">{current.empty}</p>
      </div>
    </div>
  );
}
