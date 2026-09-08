import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/lib/auth";
import { getEvent } from "../data";
import TypeBadge from "../components/TypeBadge";
import StatusBadge from "../components/StatusBadge";
import EventStatusSelect from "../components/EventStatusSelect";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="font-label-caps text-label-caps text-outline mb-1">{label}</p>
      <p className="font-body-md text-primary text-sm">{value}</p>
    </div>
  );
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const event = await getEvent(id, session.user.id);
  if (!event) notFound();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-primary">{event.title}</h1>
            <TypeBadge type={event.type} />
            <StatusBadge status={event.status} />
          </div>
          <p className="font-body-md text-on-surface-variant text-sm">
            {new Date(event.event_date).toLocaleDateString("pt-BR")}
            {event.event_time && ` às ${event.event_time.slice(0, 5)}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/agenda/${event.id}/editar`}
            className="border border-surface-container-high text-primary font-label-caps text-xs px-5 py-2.5 rounded-sm hover:bg-surface-container transition-colors"
          >
            EDITAR
          </Link>
          <EventStatusSelect eventId={event.id} status={event.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-surface-container-high bg-surface-container-lowest rounded-lg p-6">
        <InfoRow label="Local" value={event.location} />
        <InfoRow label="Cliente" value={event.client_full_name} />
        <InfoRow label="Processo" value={event.process_number} />
        {event.notes && (
          <div className="md:col-span-2">
            <InfoRow label="Observações" value={event.notes} />
          </div>
        )}
      </div>
    </div>
  );
}
