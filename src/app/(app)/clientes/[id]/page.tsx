import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/lib/auth";
import { getClient } from "../data";
import { formatDocument, formatPhone, formatCEP } from "@/app/lib/validators";
import { SOURCE_LABELS } from "../types";
import StatusBadge from "../components/StatusBadge";
import ClientStatusAction from "../components/ClientStatusAction";
import ClientTabs from "../components/ClientTabs";
import { listProcessesByClient } from "../../processos/data";
import { listTasksByClient } from "../../tarefas/data";
import SuccessBanner from "../../components/SuccessBanner";
import ConfirmDeleteButton from "../../components/ConfirmDeleteButton";
import { deleteClient } from "../actions";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="font-label-caps text-label-caps text-outline mb-1">{label}</p>
      <p className="font-body-md text-primary text-sm">{value}</p>
    </div>
  );
}

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sucesso?: string }>;
}) {
  const { id } = await params;
  const { sucesso } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const client = await getClient(id, session.user.id);
  if (!client) notFound();

  const [processes, tasks] = await Promise.all([
    listProcessesByClient(client.id, session.user.id),
    listTasksByClient(client.id, session.user.id),
  ]);

  const address = [client.street, client.address_number].filter(Boolean).join(", ");
  const cityState = [client.city, client.state].filter(Boolean).join(" - ");

  return (
    <div className="space-y-6 max-w-5xl">
      {sucesso === "criado" && <SuccessBanner message="Cliente cadastrado com sucesso." />}
      {sucesso === "atualizado" && <SuccessBanner message="Cliente atualizado com sucesso." />}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-primary">{client.full_name}</h1>
            <StatusBadge status={client.status} />
          </div>
          <p className="font-body-md text-on-surface-variant text-sm">
            {formatDocument(client.document_number, client.person_type)} · Cliente desde{" "}
            {new Date(client.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/clientes/${client.id}/editar`}
            className="border border-surface-container-high text-primary font-label-caps text-xs px-5 py-2.5 rounded-sm hover:bg-surface-container transition-colors"
          >
            EDITAR
          </Link>
          <ClientStatusAction clientId={client.id} status={client.status} />
          <ConfirmDeleteButton
            onConfirm={deleteClient.bind(null, client.id)}
            itemLabel="este cliente"
            variant="button"
            redirectTo="/clientes"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-surface-container-high bg-surface-container-lowest rounded-lg p-6">
        <InfoRow label="E-mail" value={client.email} />
        <InfoRow label="E-mail secundário" value={client.secondary_email} />
        <InfoRow label="Telefone" value={client.phone ? formatPhone(client.phone) : null} />
        <InfoRow label="Telefone secundário" value={client.secondary_phone ? formatPhone(client.secondary_phone) : null} />
        <InfoRow label="Endereço" value={address || null} />
        <InfoRow label="Cidade/UF" value={cityState || null} />
        <InfoRow label="Bairro" value={client.neighborhood} />
        <InfoRow label="CEP" value={client.zip_code ? formatCEP(client.zip_code) : null} />
        {client.person_type === "individual" && (
          <>
            <InfoRow label="RG" value={client.rg} />
            <InfoRow label="Estado civil" value={client.marital_status} />
            <InfoRow label="Profissão" value={client.occupation} />
          </>
        )}
        {client.person_type === "company" && <InfoRow label="Nome fantasia" value={client.trade_name} />}
        <InfoRow label="Origem" value={client.source ? SOURCE_LABELS[client.source] : null} />
        <InfoRow label="Forma de cobrança" value={client.billing_arrangement} />
        {client.notes && (
          <div className="md:col-span-2">
            <InfoRow label="Observações" value={client.notes} />
          </div>
        )}
      </div>

      <ClientTabs clientId={client.id} processes={processes} tasks={tasks} />
    </div>
  );
}
