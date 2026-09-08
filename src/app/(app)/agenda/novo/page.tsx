import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import EventForm from "../components/EventForm";
import FormModal from "../../components/FormModal";
import { createEvent } from "../actions";
import { listClientOptions } from "../../clientes/data";
import { listProcessOptions } from "../../processos/data";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; processo?: string }>;
}) {
  const { cliente, processo } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [clientOptions, processOptions] = await Promise.all([
    listClientOptions(session.user.id),
    listProcessOptions(session.user.id),
  ]);

  const closeHref = cliente ? `/clientes/${cliente}` : processo ? `/processos/${processo}` : "/agenda";

  return (
    <FormModal
      title="Novo compromisso"
      subtitle="Cadastre um compromisso ou audiência e vincule-o a um cliente ou processo, se necessário."
      closeHref={closeHref}
    >
      <EventForm
        action={createEvent}
        clientOptions={clientOptions}
        processOptions={processOptions}
        defaultClientId={cliente}
        defaultProcessId={processo}
        submitLabel="SALVAR"
      />
    </FormModal>
  );
}
