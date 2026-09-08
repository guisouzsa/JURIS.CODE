import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import Greeting from "../components/Greeting";
import { getClientStats, listRecentClients } from "../clientes/data";
import { getProcessStats, listRecentProcesses } from "../processos/data";
import { AREA_LABELS } from "../processos/types";
import ProcessStatusBadge from "../processos/components/StatusBadge";
import ClientStatusBadge from "../clientes/components/StatusBadge";
import { getTaskStats, listTasks } from "../tarefas/data";
import PriorityBadge from "../tarefas/components/PriorityBadge";
import { getEventStats } from "../agenda/data";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0];

  const [clientStats, processStats, taskStats, eventStats, recentProcesses, recentClients, pendingTasksResult] =
    await Promise.all([
      getClientStats(userId),
      getProcessStats(userId),
      getTaskStats(userId),
      getEventStats(userId),
      listRecentProcesses(userId, 6),
      listRecentClients(userId, 5),
      listTasks(userId, {}),
    ]);

  const pendingTasks = pendingTasksResult.tasks.slice(0, 5);

  const STATS = [
    { value: clientStats.active, label: "Clientes ativos" },
    { value: processStats.active, label: "Processos em andamento" },
    { value: taskStats.pending, label: "Tarefas pendentes" },
    { value: eventStats.today, label: "Compromissos hoje" },
  ];

  return (
    <div className="space-y-5 max-w-6xl">
      <header>
        <h1 className="text-2xl font-semibold text-primary mb-1">
          <Greeting />
        </h1>
        <p className="font-body-md text-on-surface-variant text-sm">
          Aqui está o que precisa da sua atenção hoje{firstName ? `, ${firstName}` : ""}.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="border border-surface-container-high bg-surface-container-lowest rounded-lg p-4"
          >
            <p className="text-2xl font-semibold text-primary mb-0.5">{stat.value}</p>
            <p className="font-body-md text-on-surface-variant text-xs">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-surface-container-high bg-surface-container-lowest rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-primary">Processos recentes</h2>
            <Link href="/processos" className="font-label-caps text-label-caps text-outline hover:text-primary transition-colors">
              VER TODOS
            </Link>
          </div>

          {recentProcesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <span className="material-symbols-outlined text-3xl text-outline">gavel</span>
              <p className="font-body-md text-on-surface-variant text-sm">Nenhum processo cadastrado ainda.</p>
              <Link
                href="/processos/novo"
                className="inline-flex items-center gap-1.5 bg-primary text-background font-label-caps text-xs px-5 py-2.5 rounded-sm hover:bg-secondary transition-colors"
              >
                <span className="material-symbols-outlined text-base">add</span>
                NOVO PROCESSO
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentProcesses.map((process) => (
                <li key={process.id}>
                  <Link
                    href={`/processos/${process.id}`}
                    className="flex items-center justify-between gap-3 border border-surface-container-high rounded-md px-4 py-3 hover:bg-surface-container transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-primary text-sm font-medium truncate">
                        {process.process_number || "Processo sem número"}
                      </p>
                      <p className="font-body-md text-on-surface-variant text-xs mt-0.5 truncate">
                        {process.client_full_name} · {AREA_LABELS[process.area]}
                      </p>
                    </div>
                    <ProcessStatusBadge status={process.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-primary">Clientes recentes</h2>
              <Link href="/clientes" className="font-label-caps text-label-caps text-outline hover:text-primary transition-colors">
                VER TODOS
              </Link>
            </div>

            {recentClients.length === 0 ? (
              <p className="font-body-md text-on-surface-variant text-xs">Nenhum cliente cadastrado ainda.</p>
            ) : (
              <ul className="space-y-2.5">
                {recentClients.map((client) => (
                  <li key={client.id}>
                    <Link
                      href={`/clientes/${client.id}`}
                      className="flex items-center justify-between gap-2 hover:text-primary transition-colors"
                    >
                      <span className="font-body-md text-primary text-sm truncate">{client.full_name}</span>
                      <ClientStatusBadge status={client.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-primary">Tarefas pendentes</h2>
              <Link href="/tarefas" className="font-label-caps text-label-caps text-outline hover:text-primary transition-colors">
                VER TODAS
              </Link>
            </div>

            {pendingTasks.length === 0 ? (
              <p className="font-body-md text-on-surface-variant text-xs">Nenhuma tarefa pendente.</p>
            ) : (
              <ul className="space-y-2.5">
                {pendingTasks.map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/tarefas/${task.id}`}
                      className="flex items-center justify-between gap-2 hover:text-primary transition-colors"
                    >
                      <span className="font-body-md text-primary text-sm truncate">{task.title}</span>
                      <PriorityBadge priority={task.priority} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
