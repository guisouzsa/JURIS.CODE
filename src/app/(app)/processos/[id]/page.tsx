import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/lib/auth";
import { getProcess } from "../data";
import { AREA_LABELS, INSTANCE_LABELS } from "../types";
import StatusBadge from "../components/StatusBadge";
import ProcessStatusSelect from "../components/ProcessStatusSelect";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="font-label-caps text-label-caps text-outline mb-1">{label}</p>
      <p className="font-body-md text-primary text-sm">{value}</p>
    </div>
  );
}

export default async function ProcessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const process = await getProcess(id, session.user.id);
  if (!process) notFound();

  const caseValueLabel = process.case_value
    ? process.case_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-primary">
              {process.process_number || "Processo sem número"}
            </h1>
            <StatusBadge status={process.status} />
          </div>
          <p className="font-body-md text-on-surface-variant text-sm">
            Cliente:{" "}
            <Link href={`/clientes/${process.client_id}`} className="text-primary hover:text-accent-gray transition-colors">
              {process.client_full_name}
            </Link>
            {" · "}Cadastrado em {new Date(process.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/processos/${process.id}/editar`}
            className="border border-surface-container-high text-primary font-label-caps text-xs px-5 py-2.5 rounded-sm hover:bg-surface-container transition-colors"
          >
            EDITAR
          </Link>
          <ProcessStatusSelect processId={process.id} status={process.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-surface-container-high bg-surface-container-lowest rounded-lg p-6">
        <InfoRow label="Área" value={AREA_LABELS[process.area]} />
        <InfoRow label="Instância" value={process.instance ? INSTANCE_LABELS[process.instance] : null} />
        <InfoRow label="Vara / Tribunal" value={process.court} />
        <InfoRow label="Parte contrária" value={process.opposing_party} />
        <InfoRow label="Valor da causa" value={caseValueLabel} />
        <InfoRow
          label="Data de distribuição"
          value={process.distribution_date ? new Date(process.distribution_date).toLocaleDateString("pt-BR") : null}
        />
        {process.subject && (
          <div className="md:col-span-2">
            <InfoRow label="Objeto / assunto" value={process.subject} />
          </div>
        )}
        {process.notes && (
          <div className="md:col-span-2">
            <InfoRow label="Observações" value={process.notes} />
          </div>
        )}
      </div>
    </div>
  );
}
