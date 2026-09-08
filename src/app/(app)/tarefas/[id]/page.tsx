import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/lib/auth";
import { getTask } from "../data";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import TaskStatusSelect from "../components/TaskStatusSelect";

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="font-label-caps text-label-caps text-outline mb-1">{label}</p>
      <p className="font-body-md text-primary text-sm">{value}</p>
    </div>
  );
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const task = await getTask(id, session.user.id);
  if (!task) notFound();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-primary">{task.title}</h1>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          <p className="font-body-md text-on-surface-variant text-sm">
            Cadastrada em {new Date(task.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/tarefas/${task.id}/editar`}
            className="border border-surface-container-high text-primary font-label-caps text-xs px-5 py-2.5 rounded-sm hover:bg-surface-container transition-colors"
          >
            EDITAR
          </Link>
          <TaskStatusSelect taskId={task.id} status={task.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-surface-container-high bg-surface-container-lowest rounded-lg p-6">
        {task.client_full_name && (
          <InfoRow
            label="Cliente"
            value={task.client_full_name}
          />
        )}
        {task.process_number && <InfoRow label="Processo" value={task.process_number} />}
        <InfoRow label="Prazo" value={task.due_date ? new Date(task.due_date).toLocaleDateString("pt-BR") : null} />
        {task.description && (
          <div className="md:col-span-2">
            <InfoRow label="Descrição" value={task.description} />
          </div>
        )}
      </div>
    </div>
  );
}
