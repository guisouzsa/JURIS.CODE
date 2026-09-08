import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import TaskForm from "../components/TaskForm";
import FormModal from "../../components/FormModal";
import { createTask } from "../actions";
import { listClientOptions } from "../../clientes/data";
import { listProcessOptions } from "../../processos/data";

export default async function NewTaskPage({
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

  const closeHref = cliente ? `/clientes/${cliente}` : processo ? `/processos/${processo}` : "/tarefas";

  return (
    <FormModal
      title="Nova tarefa"
      subtitle="Cadastre uma atividade e vincule-a a um cliente ou processo, se necessário."
      closeHref={closeHref}
    >
      <TaskForm
        action={createTask}
        clientOptions={clientOptions}
        processOptions={processOptions}
        defaultClientId={cliente}
        defaultProcessId={processo}
        submitLabel="SALVAR TAREFA"
      />
    </FormModal>
  );
}
