"use client";
import { useState, type FormEvent } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { STATUS_LABELS } from "../types";

const selectClass =
  "bg-surface-container border border-surface-container-high rounded-md px-3 py-2.5 font-body-md text-primary text-sm focus:outline-none focus:border-accent-gray transition-colors";

export default function ClientsToolbar() {
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
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px]">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, CPF, e-mail ou telefone..."
          className="w-full bg-surface-container border border-surface-container-high rounded-md px-4 py-2.5 font-body-md text-primary placeholder:text-outline focus:outline-none focus:border-accent-gray transition-colors text-sm"
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
        defaultValue={searchParams.get("type") ?? "all"}
        onChange={(e) => updateParams({ type: e.target.value === "all" ? "" : e.target.value })}
        className={selectClass}
      >
        <option value="all">Física e jurídica</option>
        <option value="individual">Pessoa física</option>
        <option value="company">Pessoa jurídica</option>
      </select>
    </div>
  );
}
