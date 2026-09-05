import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import Greeting from "../components/Greeting";

// TODO: substituir pelos dados reais assim que Tarefas, Agenda, Prazos e Clientes existirem (Fases 3-6 do roadmap).
const STATS = [
  { value: 8, label: "Tarefas pendentes" },
  { value: 3, label: "Compromissos hoje" },
  { value: 2, label: "Prazos próximos" },
  { value: 14, label: "Clientes ativos" },
];

const TODAY_AGENDA = [
  { time: "09:00", title: "Reunião com cliente", subtitle: "Mariana Costa", icon: null },
  { time: "11:30", title: "Revisar documentação", subtitle: "Processo 004821", icon: null },
  { time: "14:00", title: "Audiência", subtitle: "Processo 002913", icon: "gavel" },
  { time: "16:30", title: "Retorno ao cliente", subtitle: "Carlos Almeida", icon: null },
];

const PRIORITIES = [
  { level: "Alta", title: "Preparar audiência — Processo 002913", icon: "gavel" },
  { level: "Alta", title: "Revisar documentação — Processo 004821", icon: "description" },
  { level: "Média", title: "Retornar contato do cliente", icon: "call" },
];

const PRIORITY_COLOR: Record<string, string> = {
  Alta: "text-[#ff9f7a]",
  Média: "text-[#e8c56a]",
};

const UPCOMING_DEADLINES = [
  { date: "05 SET", description: "Processo 004821" },
  { date: "08 SET", description: "Documentação — Mariana Costa" },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const firstName = session?.user.name?.split(" ")[0];

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
          <h2 className="text-base font-semibold text-primary mb-4">Hoje</h2>
          <div className="space-y-3">
            {TODAY_AGENDA.map((item) => (
              <div key={`${item.time}-${item.title}`} className="flex items-start gap-3">
                <span className="font-body-md text-on-surface-variant text-xs w-10 shrink-0 pt-0.5 tabular-nums">
                  {item.time}
                </span>
                <div className="w-px self-stretch bg-surface-container-high relative shrink-0">
                  <span className="absolute -left-[3px] top-1 w-[7px] h-[7px] rounded-full bg-accent-gray" />
                </div>
                <div className="pb-0.5">
                  <p className="font-body-md text-primary text-sm flex items-center gap-1.5">
                    {item.title}
                    {item.icon && (
                      <span className="material-symbols-outlined text-sm text-outline">{item.icon}</span>
                    )}
                  </p>
                  <p className="font-body-md text-on-surface-variant text-xs">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg p-5">
            <h2 className="text-base font-semibold text-primary mb-3">Prioridades</h2>
            <ul className="space-y-2.5">
              {PRIORITIES.map((item) => (
                <li key={item.title} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-base text-outline mt-0.5 shrink-0">{item.icon}</span>
                  <p className="font-body-md text-on-surface-variant text-xs leading-snug">
                    <span className={`font-medium ${PRIORITY_COLOR[item.level]}`}>[{item.level}]</span>{" "}
                    {item.title}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg p-5">
            <h2 className="text-base font-semibold text-primary mb-3">Próximos prazos</h2>
            <ul className="space-y-2.5">
              {UPCOMING_DEADLINES.map((item) => (
                <li key={item.date + item.description} className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-base text-outline shrink-0">calendar_today</span>
                  <p className="font-body-md text-on-surface-variant text-xs">
                    <span className="text-primary font-medium">{item.date}</span> - {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
