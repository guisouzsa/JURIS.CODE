"use client";
import { useState, type FormEvent } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { STATUS_LABELS, TYPE_LABELS } from "../types";

const selectClass =
  "bg-surface-container border border-surface-container-high rounded-md px-3 py-2.5 font-body-md text-primary text-sm focus:outline-none focus:border-accent-gray transition-colors";

export default function AgendaToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    updateParams({ q: search });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-5 bg-surface-container-lowest border border-surface-container-high rounded-lg p-3">
      <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px]">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-outline pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título..."
          className="w-full bg-surface-container border border-surface-container-high rounded-md pl-10 pr-4 py-2.5 font-body-md text-primary placeholder:text-outline focus:outline-none focus:border-accent-gray transition-colors text-sm"
        />
      </form>

      <select
        defaultValue={searchParams.get("type") ?? "all"}
        onChange={(e) => updateParams({ type: e.target.value === "all" ? "" : e.target.value })}
        className={selectClass}
      >
        <option value="all">Tudo (compromissos, audiências e prazos)</option>
        {Object.entries(TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}s</option>
        ))}
        <option value="prazo">Prazos de tarefas</option>
      </select>

      <select
        defaultValue={searchParams.get("status") ?? "all"}
        onChange={(e) => updateParams({ status: e.target.value === "all" ? "" : e.target.value })}
        className={selectClass}
      >
        <option value="all">Todos os status</option>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <label className="flex items-center gap-2 font-body-md text-on-surface-variant text-sm px-1">
        <input
          type="checkbox"
          defaultChecked={searchParams.get("passados") === "1"}
          onChange={(e) => updateParams({ passados: e.target.checked ? "1" : "" })}
          className="accent-primary"
        />
        Incluir datas passadas
      </label>
    </div>
  );
}
