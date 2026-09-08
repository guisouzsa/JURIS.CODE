import { Suspense } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { PROCESSES_PAGE_SIZE, listProcesses } from "./data";
import type { ProcessArea, ProcessStatus } from "./types";
import { AREA_LABELS } from "./types";
import ProcessesToolbar from "./components/ProcessesToolbar";
import StatusBadge from "./components/StatusBadge";

type SearchParams = { q?: string; status?: string; area?: string; page?: string };

export default async function ProcessesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const hasFilters = Boolean(sp.q || sp.status || sp.area);
  const page = Number(sp.page ?? "1") || 1;

  const { processes, total } = await listProcesses(session.user.id, {
    search: sp.q,
    status: (sp.status as ProcessStatus | undefined) ?? "all",
    area: (sp.area as ProcessArea | undefined) ?? "all",
    page,
  });

  const totalPages = Math.max(Math.ceil(total / PROCESSES_PAGE_SIZE), 1);

  return (
    <div>
      <header className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold text-primary">Processos</h1>
          <p className="font-body-md text-on-surface-variant text-sm max-w-xl">
            Acompanhe os processos de cada cliente, com prazos, andamentos e status atualizados.
          </p>
        </div>
        <Link
          href="/processos/novo"
          className="inline-flex items-center gap-1.5 bg-primary text-background font-label-caps text-xs px-6 py-3 rounded-sm hover:bg-secondary transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-base">add</span>
          NOVO PROCESSO
        </Link>
      </header>

      <Suspense fallback={null}>
        <ProcessesToolbar />
      </Suspense>

      {processes.length > 0 && (
        <p className="font-body-md text-on-surface-variant text-sm mb-3">
          {total} processo{total === 1 ? "" : "s"} {hasFilters ? "encontrado" + (total === 1 ? "" : "s") : "no total"}
        </p>
      )}

      {processes.length === 0 ? (
        <div className="border border-surface-container-high bg-surface-container-lowest rounded-xl py-20 px-6 flex flex-col items-center text-center gap-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-surface-container border border-surface-container-high">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">gavel</span>
          </div>
          <div className="space-y-1.5 max-w-sm">
            <p className="text-primary font-semibold text-lg">
              {hasFilters ? "Nenhum processo encontrado" : "Nenhum processo cadastrado"}
            </p>
            <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
              {hasFilters
                ? "Ajuste a busca ou os filtros de status e área para encontrar o que procura."
                : "Cadastre o primeiro processo vinculado a um cliente para começar a acompanhar prazos e andamentos."}
            </p>
          </div>
          {!hasFilters && (
            <Link
              href="/processos/novo"
              className="mt-2 inline-flex items-center gap-1.5 bg-primary text-background font-label-caps text-xs px-6 py-3 rounded-sm hover:bg-secondary transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              NOVO PROCESSO
            </Link>
          )}
        </div>
      ) : (
        <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left border-b border-surface-container-high">
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Número</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Cliente</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Área</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Status</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Cadastro</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {processes.map((process) => (
                <tr key={process.id} className="border-b border-surface-container-high/60 last:border-0 hover:bg-surface-container transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/processos/${process.id}`} className="text-primary hover:text-accent-gray transition-colors font-medium">
                      {process.process_number || "Sem número"}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-on-surface-variant">
                    <Link href={`/clientes/${process.client_id}`} className="hover:text-primary transition-colors">
                      {process.client_full_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-on-surface-variant">{AREA_LABELS[process.area]}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={process.status} />
                  </td>
                  <td className="px-5 py-3 text-on-surface-variant">
                    {new Date(process.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/processos/${process.id}`}
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        aria-label="Ver detalhes"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </Link>
                      <Link
                        href={`/processos/${process.id}/editar`}
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        aria-label="Editar"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
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
  if (searchParams.area) params.set("area", searchParams.area);
  params.set("page", String(page));

  return (
    <Link
      href={`/processos?${params.toString()}`}
      className="border border-surface-container-high text-primary text-xs font-label-caps px-4 py-2 rounded-sm hover:bg-surface-container transition-colors"
    >
      {label.toUpperCase()}
    </Link>
  );
}
