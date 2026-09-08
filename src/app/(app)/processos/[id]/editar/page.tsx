import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import ProcessForm from "../../components/ProcessForm";
import FormModal from "../../../components/FormModal";
import { getProcess } from "../../data";
import { updateProcess } from "../../actions";
import { listClientOptions } from "../../../clientes/data";

export default async function EditProcessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [process, clientOptions] = await Promise.all([
    getProcess(id, session.user.id),
    listClientOptions(session.user.id),
  ]);
  if (!process) notFound();

  const action = updateProcess.bind(null, process.id);

  return (
    <FormModal
      title="Editar processo"
      subtitle={process.process_number || process.client_full_name}
      closeHref={`/processos/${process.id}`}
    >
      <ProcessForm
        action={action}
        initialData={process}
        clientOptions={clientOptions}
        submitLabel="SALVAR ALTERAÇÕES"
      />
    </FormModal>
  );
}
