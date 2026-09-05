import { Suspense } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { formatDocument, formatPhone } from "@/app/lib/validators";
import { CLIENTS_PAGE_SIZE, listClients } from "./data";
import type { ClientStatus } from "./types";
import ClientsToolbar from "./components/ClientsToolbar";
import StatusBadge from "./components/StatusBadge";
import ClientStatusAction from "./components/ClientStatusAction";

type SearchParams = { q?: string; status?: string; type?: string; page?: string };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const hasFilters = Boolean(sp.q || sp.status || sp.type);
  const page = Number(sp.page ?? "1") || 1;

  const { clients, total } = await listClients(session.user.id, {
    search: sp.q,
    status: (sp.status as ClientStatus | undefined) ?? "all",
    personType: (sp.type as "individual" | "company" | undefined) ?? "all",
    page,
  });

  const totalPages = Math.max(Math.ceil(total / CLIENTS_PAGE_SIZE), 1);
  const ownerName = session.user.name ?? session.user.email ?? "Você";

  return (
    <div>
      <header className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-primary mb-1">Clientes</h1>
          <p className="font-body-md text-on-surface-variant text-sm">
            Gerencie seus clientes e acompanhe todas as informações relacionadas a cada atendimento.
          </p>
        </div>
        <Link
          href="/clientes/novo"
          className="bg-primary text-background font-label-caps text-xs px-6 py-3 rounded-sm hover:bg-secondary transition-colors shrink-0"
        >
          + NOVO CLIENTE
        </Link>
      </header>

      <Suspense fallback={null}>
        <ClientsToolbar />
      </Suspense>

      {clients.length === 0 ? (
        <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg py-16 px-6 flex flex-col items-center text-center gap-3">
          <span className="material-symbols-outlined text-3xl text-outline">group</span>
          {hasFilters ? (
            <p className="font-body-md text-on-surface-variant text-sm">
              Nenhum cliente encontrado com esses filtros.
            </p>
          ) : (
            <>
              <p className="text-primary font-medium">Nenhum cliente cadastrado</p>
              <p className="font-body-md text-on-surface-variant text-sm">Comece adicionando seu primeiro cliente.</p>
              <Link
                href="/clientes/novo"
                className="mt-2 bg-primary text-background font-label-caps text-xs px-6 py-3 rounded-sm hover:bg-secondary transition-colors"
              >
                + NOVO CLIENTE
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left border-b border-surface-container-high">
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Nome</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">CPF/CNPJ</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Telefone</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Status</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Responsável</th>
                <th className="font-label-caps text-label-caps text-outline font-normal px-5 py-3">Cadastro</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-surface-container-high/60 last:border-0 hover:bg-surface-container transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/clientes/${client.id}`} className="text-primary hover:text-accent-gray transition-colors font-medium">
                      {client.full_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-on-surface-variant">{formatDocument(client.document_number, client.person_type)}</td>
                  <td className="px-5 py-3 text-on-surface-variant">{client.phone ? formatPhone(client.phone) : "—"}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="px-5 py-3 text-on-surface-variant">{ownerName}</td>
                  <td className="px-5 py-3 text-on-surface-variant">
                    {new Date(client.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/clientes/${client.id}/editar`}
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        aria-label="Editar"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <ClientStatusAction clientId={client.id} status={client.status} />
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
            Página {page} de {totalPages} · {total} cliente{total === 1 ? "" : "s"}
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
  if (searchParams.type) params.set("type", searchParams.type);
  params.set("page", String(page));

  return (
    <Link
      href={`/clientes?${params.toString()}`}
      className="border border-surface-container-high text-primary text-xs font-label-caps px-4 py-2 rounded-sm hover:bg-surface-container transition-colors"
    >
      {label.toUpperCase()}
    </Link>
  );
}
