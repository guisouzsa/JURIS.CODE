import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import ProcessForm from "../components/ProcessForm";
import FormModal from "../../components/FormModal";
import { createProcess } from "../actions";
import { listClientOptions } from "../../clientes/data";

export default async function NewProcessPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  const { cliente } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const clientOptions = await listClientOptions(session.user.id);
  const closeHref = cliente ? `/clientes/${cliente}` : "/processos";

  return (
    <FormModal
      title="Novo processo"
      subtitle="Cadastre um processo e vincule-o a um cliente para acompanhar prazos e andamentos."
      closeHref={closeHref}
    >
      <ProcessForm
        action={createProcess}
        clientOptions={clientOptions}
        defaultClientId={cliente}
        submitLabel="SALVAR PROCESSO"
      />
    </FormModal>
  );
}
