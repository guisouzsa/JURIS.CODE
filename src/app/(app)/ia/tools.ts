import { listTasks, getTaskStats, getTaskBreakdown, listTasksByClient, listTasksByProcess } from "../tarefas/data";
import { PRIORITY_LABELS, STATUS_LABELS as TASK_STATUS_LABELS, type TaskPriority, type TaskStatus } from "../tarefas/types";
import { listProcesses, getProcessStats, getProcessBreakdown, listProcessesByClient } from "../processos/data";
import {
  AREA_LABELS,
  STATUS_LABELS as PROCESS_STATUS_LABELS,
  type ProcessArea,
  type ProcessStatus,
} from "../processos/types";
import { listClients, getClientStats, getClientStatusBreakdown } from "../clientes/data";
import { STATUS_LABELS as CLIENT_STATUS_LABELS, type ClientStatus } from "../clientes/types";
import { getAgendaFeed, getEventStats, listEventsByClient, listEventsByProcess } from "../agenda/data";
import { STATUS_LABELS as EVENT_STATUS_LABELS, TYPE_LABELS as EVENT_TYPE_LABELS } from "../agenda/types";

export type AssistantToolDeclaration = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export const ASSISTANT_TOOLS: AssistantToolDeclaration[] = [
  {
    name: "get_overview_stats",
    description:
      "Retorna um resumo numérico do escritório: clientes ativos e total, processos em andamento e concluídos, tarefas pendentes e atrasadas, e compromissos de hoje. Use primeiro para qualquer pergunta ampla ('o que tenho cadastrado', 'como está tudo') antes de decidir se deve detalhar algum módulo.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_breakdown",
    description:
      "Retorna a contagem de registros agrupada por uma dimensão (ex.: quantos processos por área, quantos clientes por status). Use para perguntas do tipo 'quantos X por Y'. Não liste os registros individuais para isso — use esta ferramenta.",
    parameters: {
      type: "object",
      properties: {
        module: { type: "string", enum: ["clientes", "processos", "tarefas"] },
        by: {
          type: "string",
          enum: ["status", "area", "priority"],
          description: "'area' só é válido para processos; 'priority' só para tarefas; 'status' vale para os três.",
        },
      },
      required: ["module", "by"],
    },
  },
  {
    name: "get_agenda",
    description:
      "Lista compromissos, audiências e prazos de tarefas num intervalo de datas, em ordem cronológica. Passe 'from' e 'to' (formato YYYY-MM-DD) para um período exato que você já calculou a partir da data de hoje (ex.: 'esta semana', 'sexta-feira'), ou use 'days' para os próximos N dias a partir de hoje.",
    parameters: {
      type: "object",
      properties: {
        from: { type: "string", description: "Data inicial (YYYY-MM-DD). Padrão: hoje." },
        to: { type: "string", description: "Data final (YYYY-MM-DD). Obrigatório se 'from' for informado." },
        days: { type: "integer", description: "Alternativa a from/to: quantos dias à frente de hoje. Padrão 7." },
      },
    },
  },
  {
    name: "list_tasks",
    description: "Busca tarefas cadastradas, com filtros opcionais de status, prioridade e texto do título.",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["pending", "in_progress", "done", "canceled", "all"],
          description: "Padrão: oculta tarefas concluídas e canceladas.",
        },
        priority: { type: "string", enum: ["low", "medium", "high", "all"] },
        search: { type: "string", description: "Termo de busca no título da tarefa." },
        limit: { type: "integer", description: "Máximo de resultados por página (padrão 10, máximo 20)." },
        page: { type: "integer", description: "Página de resultados, começando em 1. Use para 'mostrar mais'." },
      },
    },
  },
  {
    name: "list_processes",
    description:
      "Busca processos judiciais cadastrados, com filtros opcionais de status, área e texto (número, assunto ou parte contrária). Para buscar processos de um cliente específico pelo nome, use get_client_details em vez desta.",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["active", "suspended", "archived", "won", "lost", "appeal", "all"],
        },
        area: {
          type: "string",
          enum: [
            "civil", "trabalhista", "tributario", "criminal", "familia",
            "previdenciario", "empresarial", "consumidor", "administrativo", "outro", "all",
          ],
        },
        search: { type: "string" },
        limit: { type: "integer", description: "Máximo de resultados por página (padrão 10, máximo 20)." },
        page: { type: "integer", description: "Página de resultados, começando em 1. Use para 'mostrar mais'." },
      },
    },
  },
  {
    name: "list_clients",
    description: "Busca clientes cadastrados, com filtros opcionais de status e nome. Resultados vêm em ordem alfabética.",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["active", "inactive", "prospect", "former", "all"] },
        search: { type: "string" },
        limit: { type: "integer", description: "Máximo de resultados por página (padrão 10, máximo 20)." },
        page: { type: "integer", description: "Página de resultados, começando em 1. Use para 'mostrar mais'." },
      },
    },
  },
  {
    name: "get_client_details",
    description:
      "Busca UM cliente pelo nome e retorna seus dados junto com processos, tarefas e compromissos vinculados a ele. Use sempre que o usuário perguntar sobre um cliente específico pelo nome (ex.: 'processos da Mariana', 'tudo relacionado ao Carlos Almeida'). Se houver mais de um cliente com nome parecido, a ferramenta retorna a lista de opções em vez dos detalhes — nesse caso, pergunte ao usuário qual deles antes de prosseguir.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nome (completo ou parcial) do cliente." },
      },
      required: ["name"],
    },
  },
  {
    name: "get_process_details",
    description:
      "Busca UM processo (por número, assunto ou parte contrária) e retorna seus dados junto com as tarefas e compromissos vinculados a ele. Use quando o usuário perguntar sobre um processo específico (ex.: 'tarefas do processo 004821'). Se houver mais de uma correspondência, a ferramenta retorna a lista de opções — pergunte ao usuário qual antes de prosseguir.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Número do processo, assunto ou parte contrária a buscar." },
      },
      required: ["query"],
    },
  },
];

function clampLimit(value: unknown, fallback = 10, max = 20): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

function clampPage(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function todayPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const NOT_INFORMED = "Não informado";

function orNotInformed(value: string | null | undefined): string {
  return value && value.trim() ? value : NOT_INFORMED;
}

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

export async function runAssistantTool(
  userId: string,
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "get_overview_stats": {
      const [clients, processes, tasks, events] = await Promise.all([
        getClientStats(userId),
        getProcessStats(userId),
        getTaskStats(userId),
        getEventStats(userId),
      ]);
      return {
        clientes_ativos: clients.active,
        clientes_total: clients.total,
        processos_em_andamento: processes.active,
        processos_concluidos: processes.concluded,
        tarefas_pendentes: tasks.pending,
        tarefas_atrasadas: tasks.overdue,
        compromissos_hoje: events.today,
      };
    }

    case "get_breakdown": {
      const moduleName = args.module as string;
      const by = args.by as "status" | "area" | "priority";
      if (moduleName === "clientes") {
        const counts = await getClientStatusBreakdown(userId);
        return Object.fromEntries(
          Object.entries(counts).map(([status, n]) => [CLIENT_STATUS_LABELS[status as ClientStatus], n])
        );
      }
      if (moduleName === "processos") {
        const counts = await getProcessBreakdown(userId, by === "area" ? "area" : "status");
        const labels = by === "area" ? AREA_LABELS : PROCESS_STATUS_LABELS;
        return Object.fromEntries(
          Object.entries(counts).map(([key, n]) => [labels[key as keyof typeof labels] ?? key, n])
        );
      }
      if (moduleName === "tarefas") {
        const counts = await getTaskBreakdown(userId, by === "priority" ? "priority" : "status");
        const labels = by === "priority" ? PRIORITY_LABELS : TASK_STATUS_LABELS;
        return Object.fromEntries(
          Object.entries(counts).map(([key, n]) => [labels[key as keyof typeof labels] ?? key, n])
        );
      }
      throw new Error("Módulo inválido para agrupamento.");
    }

    case "get_agenda": {
      const today = new Date().toISOString().slice(0, 10);
      const from = typeof args.from === "string" && args.from ? args.from : today;
      const to =
        typeof args.to === "string" && args.to
          ? args.to
          : todayPlusDays(
              Number.isFinite(Number(args.days)) ? Math.max(0, Math.min(Number(args.days), 60)) : 7
            );
      const items = await getAgendaFeed(userId, from, to);
      if (items.length === 0) {
        return { mensagem: "Nada agendado nesse período.", itens: [] };
      }
      return {
        itens: items.map((item) => ({
          tipo: item.kind === "event" ? EVENT_TYPE_LABELS[item.type] : "Prazo de tarefa",
          titulo: item.title,
          data: item.event_date,
          hora: item.kind === "event" ? item.event_time : null,
          cliente: orNotInformed(item.client_full_name),
          processo: orNotInformed(item.process_number),
          status: item.kind === "event" ? EVENT_STATUS_LABELS[item.status] : undefined,
          prioridade: item.kind === "task" ? PRIORITY_LABELS[item.priority] : undefined,
        })),
      };
    }

    case "list_tasks": {
      const limit = clampLimit(args.limit);
      const page = clampPage(args.page);
      const { tasks, total } = await listTasks(userId, {
        search: typeof args.search === "string" ? args.search : undefined,
        status: args.status as TaskStatus | "all" | undefined,
        priority: args.priority as TaskPriority | "all" | undefined,
        page,
      });
      if (tasks.length === 0) {
        return { mensagem: "Nenhuma tarefa encontrada.", total: 0, tarefas: [] };
      }
      const sorted = [...tasks].sort((a, b) => {
        const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (rankDiff !== 0) return rankDiff;
        if (a.due_date && b.due_date) return a.due_date < b.due_date ? -1 : 1;
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return 0;
      });
      return {
        total,
        pagina: page,
        mostrando: Math.min(limit, sorted.length),
        tarefas: sorted.slice(0, limit).map((task) => ({
          titulo: task.title,
          status: TASK_STATUS_LABELS[task.status],
          prioridade: PRIORITY_LABELS[task.priority],
          prazo: task.due_date ?? "Sem prazo definido",
          cliente: orNotInformed(task.client_full_name),
          processo: orNotInformed(task.process_number),
        })),
      };
    }

    case "list_processes": {
      const limit = clampLimit(args.limit);
      const page = clampPage(args.page);
      const { processes, total } = await listProcesses(userId, {
        search: typeof args.search === "string" ? args.search : undefined,
        status: args.status as ProcessStatus | "all" | undefined,
        area: args.area as ProcessArea | "all" | undefined,
        page,
      });
      if (processes.length === 0) {
        return { mensagem: "Nenhum processo encontrado.", total: 0, processos: [] };
      }
      return {
        total,
        pagina: page,
        mostrando: Math.min(limit, processes.length),
        processos: processes.slice(0, limit).map((process) => ({
          numero: process.process_number ? process.process_number : "Sem número informado",
          cliente: orNotInformed(process.client_full_name),
          area: AREA_LABELS[process.area],
          status: PROCESS_STATUS_LABELS[process.status],
        })),
      };
    }

    case "list_clients": {
      const limit = clampLimit(args.limit);
      const page = clampPage(args.page);
      const { clients, total } = await listClients(userId, {
        search: typeof args.search === "string" ? args.search : undefined,
        status: args.status as ClientStatus | "all" | undefined,
        personType: "all",
        page,
        orderBy: "name",
      });
      if (clients.length === 0) {
        return { mensagem: "Nenhum cliente encontrado.", total: 0, clientes: [] };
      }
      return {
        total,
        pagina: page,
        mostrando: Math.min(limit, clients.length),
        clientes: clients.slice(0, limit).map((client) => ({
          nome: client.full_name,
          status: CLIENT_STATUS_LABELS[client.status],
        })),
      };
    }

    case "get_client_details": {
      const name = typeof args.name === "string" ? args.name : "";
      const { clients, total } = await listClients(userId, { search: name, personType: "all", page: 1 });

      if (total === 0) {
        return { encontrado: false, mensagem: `Nenhum cliente encontrado com o nome "${name}".` };
      }
      if (total > 1) {
        return {
          ambiguo: true,
          mensagem: `Encontrei ${total} clientes com esse nome. Pergunte ao usuário qual deles.`,
          opcoes: clients.map((c) => ({ nome: c.full_name, status: CLIENT_STATUS_LABELS[c.status] })),
        };
      }

      const client = clients[0];
      const [processes, tasks, events] = await Promise.all([
        listProcessesByClient(client.id, userId),
        listTasksByClient(client.id, userId),
        listEventsByClient(client.id, userId),
      ]);

      return {
        cliente: { nome: client.full_name, status: CLIENT_STATUS_LABELS[client.status] },
        processos: {
          total: processes.length,
          itens: processes.map((p) => ({
            numero: p.process_number || "Sem número informado",
            area: AREA_LABELS[p.area],
            status: PROCESS_STATUS_LABELS[p.status],
          })),
        },
        tarefas: {
          total: tasks.length,
          itens: tasks.map((t) => ({
            titulo: t.title,
            status: TASK_STATUS_LABELS[t.status],
            prioridade: PRIORITY_LABELS[t.priority],
            prazo: t.due_date ?? "Sem prazo definido",
          })),
        },
        compromissos: {
          total: events.length,
          itens: events.map((e) => ({
            titulo: e.title,
            data: e.event_date,
            tipo: EVENT_TYPE_LABELS[e.type],
            status: EVENT_STATUS_LABELS[e.status],
          })),
        },
      };
    }

    case "get_process_details": {
      const query = typeof args.query === "string" ? args.query : "";
      const { processes, total } = await listProcesses(userId, { search: query, status: "all", page: 1 });

      if (total === 0) {
        return { encontrado: false, mensagem: `Nenhum processo encontrado para "${query}".` };
      }
      if (total > 1) {
        return {
          ambiguo: true,
          mensagem: `Encontrei ${total} processos correspondentes. Pergunte ao usuário qual deles.`,
          opcoes: processes.map((p) => ({
            numero: p.process_number || "Sem número informado",
            cliente: orNotInformed(p.client_full_name),
            area: AREA_LABELS[p.area],
          })),
        };
      }

      const process = processes[0];
      const [tasks, events] = await Promise.all([
        listTasksByProcess(process.id, userId),
        listEventsByProcess(process.id, userId),
      ]);

      return {
        processo: {
          numero: process.process_number || "Sem número informado",
          cliente: orNotInformed(process.client_full_name),
          area: AREA_LABELS[process.area],
          status: PROCESS_STATUS_LABELS[process.status],
        },
        tarefas: {
          total: tasks.length,
          itens: tasks.map((t) => ({
            titulo: t.title,
            status: TASK_STATUS_LABELS[t.status],
            prioridade: PRIORITY_LABELS[t.priority],
            prazo: t.due_date ?? "Sem prazo definido",
          })),
        },
        compromissos: {
          total: events.length,
          itens: events.map((e) => ({
            titulo: e.title,
            data: e.event_date,
            tipo: EVENT_TYPE_LABELS[e.type],
            status: EVENT_STATUS_LABELS[e.status],
          })),
        },
      };
    }

    default:
      throw new Error(`Ferramenta desconhecida: ${name}`);
  }
}
