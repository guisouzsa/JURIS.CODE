"use client";
import { useState, type FormEvent } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AREA_LABELS, STATUS_LABELS } from "../types";

const selectClass =
  "bg-surface-container border border-surface-container-high rounded-md px-3 py-2.5 font-body-md text-primary text-sm focus:outline-none focus:border-accent-gray transition-colors";

export default function ProcessesToolbar() {
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
    params.delete("page");
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
          placeholder="Buscar por número, assunto ou parte contrária..."
          className="w-full bg-surface-container border border-surface-container-high rounded-md pl-10 pr-4 py-2.5 font-body-md text-primary placeholder:text-outline focus:outline-none focus:border-accent-gray transition-colors text-sm"
        />
      </form>

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

      <select
        defaultValue={searchParams.get("area") ?? "all"}
        onChange={(e) => updateParams({ area: e.target.value === "all" ? "" : e.target.value })}
        className={selectClass}
      >
        <option value="all">Todas as áreas</option>
        {Object.entries(AREA_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
}
