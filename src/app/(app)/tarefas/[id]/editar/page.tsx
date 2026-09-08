import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import TaskForm from "../../components/TaskForm";
import FormModal from "../../../components/FormModal";
import { getTask } from "../../data";
import { updateTask } from "../../actions";
import { listClientOptions } from "../../../clientes/data";
import { listProcessOptions } from "../../../processos/data";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [task, clientOptions, processOptions] = await Promise.all([
    getTask(id, session.user.id),
    listClientOptions(session.user.id),
    listProcessOptions(session.user.id),
  ]);
  if (!task) notFound();

  const action = updateTask.bind(null, task.id);

  return (
    <FormModal title="Editar tarefa" subtitle={task.title} closeHref={`/tarefas/${task.id}`}>
      <TaskForm
        action={action}
        initialData={task}
        clientOptions={clientOptions}
        processOptions={processOptions}
        submitLabel="SALVAR ALTERAÇÕES"
      />
    </FormModal>
  );
}
