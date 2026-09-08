import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import EventForm from "../../components/EventForm";
import FormModal from "../../../components/FormModal";
import { getEvent } from "../../data";
import { updateEvent } from "../../actions";
import { listClientOptions } from "../../../clientes/data";
import { listProcessOptions } from "../../../processos/data";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [event, clientOptions, processOptions] = await Promise.all([
    getEvent(id, session.user.id),
    listClientOptions(session.user.id),
    listProcessOptions(session.user.id),
  ]);
  if (!event) notFound();

  const action = updateEvent.bind(null, event.id);

  return (
    <FormModal title="Editar compromisso" subtitle={event.title} closeHref={`/agenda/${event.id}`}>
      <EventForm
        action={action}
        initialData={event}
        clientOptions={clientOptions}
        processOptions={processOptions}
        submitLabel="SALVAR ALTERAÇÕES"
      />
    </FormModal>
  );
}
