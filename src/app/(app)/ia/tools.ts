import { Type, type FunctionDeclaration } from "@google/genai";
import { listTasks, getTaskStats } from "../tarefas/data";
import type { TaskPriority, TaskStatus } from "../tarefas/types";
import { listProcesses, getProcessStats } from "../processos/data";
import type { ProcessArea, ProcessStatus } from "../processos/types";
import { listClients, getClientStats } from "../clientes/data";
import type { ClientStatus } from "../clientes/types";
import { getAgendaFeed, getEventStats } from "../agenda/data";

export const ASSISTANT_TOOLS: FunctionDeclaration[] = [
  {
    name: "get_overview_stats",
    description:
      "Retorna um resumo numérico do escritório: clientes ativos e total, processos em andamento e concluídos, tarefas pendentes e atrasadas, e compromissos de hoje. Use para perguntas gerais como 'como está tudo' ou 'quantos clientes eu tenho'.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "get_agenda",
    description:
      "Lista compromissos, audiências e prazos de tarefas dos próximos N dias (incluindo hoje), em ordem cronológica. Use para responder sobre prioridades do dia, da semana, ou o que está agendado.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        days: {
          type: Type.INTEGER,
          description: "Quantos dias à frente considerar a partir de hoje. Padrão 7. Use 0 para só hoje.",
        },
      },
    },
  },
  {
    name: "list_tasks",
    description: "Busca tarefas cadastradas, com filtros opcionais de status, prioridade e texto do título.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          enum: ["pending", "in_progress", "done", "canceled", "all"],
          description: "Padrão: oculta tarefas concluídas e canceladas.",
        },
        priority: { type: Type.STRING, enum: ["low", "medium", "high", "all"] },
        search: { type: Type.STRING, description: "Termo de busca no título da tarefa." },
        limit: { type: Type.INTEGER, description: "Máximo de resultados (padrão 10, máximo 20)." },
      },
    },
  },
  {
    name: "list_processes",
    description:
      "Busca processos judiciais cadastrados, com filtros opcionais de status, área e texto (número, assunto ou parte contrária).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          enum: ["active", "suspended", "archived", "won", "lost", "appeal", "all"],
        },
        area: {
          type: Type.STRING,
          enum: [
            "civil", "trabalhista", "tributario", "criminal", "familia",
            "previdenciario", "empresarial", "consumidor", "administrativo", "outro", "all",
          ],
        },
        search: { type: Type.STRING },
        limit: { type: Type.INTEGER, description: "Máximo de resultados (padrão 10, máximo 20)." },
      },
    },
  },
  {
    name: "list_clients",
    description: "Busca clientes cadastrados, com filtros opcionais de status e nome.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, enum: ["active", "inactive", "prospect", "former", "all"] },
        search: { type: Type.STRING },
        limit: { type: Type.INTEGER, description: "Máximo de resultados (padrão 10, máximo 20)." },
      },
    },
  },
];

function clampLimit(value: unknown, fallback = 10, max = 20): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

function todayPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

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

    case "get_agenda": {
      const daysArg = Number(args.days);
      const days = Number.isFinite(daysArg) ? Math.max(0, Math.min(daysArg, 60)) : 7;
      const today = new Date().toISOString().slice(0, 10);
      const items = await getAgendaFeed(userId, today, todayPlusDays(days));
      return items.map((item) => ({
        tipo: item.kind === "event" ? item.type : "prazo_tarefa",
        titulo: item.title,
        data: item.event_date,
        hora: item.kind === "event" ? item.event_time : null,
        cliente: item.client_full_name,
        processo: item.process_number,
        status: item.kind === "event" ? item.status : undefined,
        prioridade: item.kind === "task" ? item.priority : undefined,
      }));
    }

    case "list_tasks": {
      const limit = clampLimit(args.limit);
      const { tasks } = await listTasks(userId, {
        search: typeof args.search === "string" ? args.search : undefined,
        status: args.status as TaskStatus | "all" | undefined,
        priority: args.priority as TaskPriority | "all" | undefined,
        page: 1,
      });
      return tasks.slice(0, limit).map((task) => ({
        titulo: task.title,
        status: task.status,
        prioridade: task.priority,
        prazo: task.due_date,
        cliente: task.client_full_name,
        processo: task.process_number,
      }));
    }

    case "list_processes": {
      const limit = clampLimit(args.limit);
      const { processes } = await listProcesses(userId, {
        search: typeof args.search === "string" ? args.search : undefined,
        status: args.status as ProcessStatus | "all" | undefined,
        area: args.area as ProcessArea | "all" | undefined,
        page: 1,
      });
      return processes.slice(0, limit).map((process) => ({
        numero: process.process_number,
        cliente: process.client_full_name,
        area: process.area,
        status: process.status,
      }));
    }

    case "list_clients": {
      const limit = clampLimit(args.limit);
      const { clients } = await listClients(userId, {
        search: typeof args.search === "string" ? args.search : undefined,
        status: args.status as ClientStatus | "all" | undefined,
        personType: "all",
        page: 1,
      });
      return clients.slice(0, limit).map((client) => ({
        nome: client.full_name,
        status: client.status,
      }));
    }

    default:
      throw new Error(`Ferramenta desconhecida: ${name}`);
  }
}
