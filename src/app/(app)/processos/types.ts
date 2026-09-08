export type ProcessArea =
  | "civil"
  | "trabalhista"
  | "tributario"
  | "criminal"
  | "familia"
  | "previdenciario"
  | "empresarial"
  | "consumidor"
  | "administrativo"
  | "outro";

export type ProcessInstance = "1_grau" | "2_grau" | "superior";

export type ProcessStatus = "active" | "suspended" | "archived" | "won" | "lost" | "appeal";

export interface LegalProcess {
  id: string;
  user_id: string;
  client_id: string;
  process_number: string | null;
  area: ProcessArea;
  instance: ProcessInstance | null;
  court: string | null;
  opposing_party: string | null;
  subject: string | null;
  case_value: number | null;
  distribution_date: string | null;
  status: ProcessStatus;
  owner_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export type ProcessWithClient = LegalProcess & { client_full_name: string };

export const AREA_LABELS: Record<ProcessArea, string> = {
  civil: "Cível",
  trabalhista: "Trabalhista",
  tributario: "Tributário",
  criminal: "Criminal",
  familia: "Família",
  previdenciario: "Previdenciário",
  empresarial: "Empresarial",
  consumidor: "Consumidor",
  administrativo: "Administrativo",
  outro: "Outro",
};

export const INSTANCE_LABELS: Record<ProcessInstance, string> = {
  "1_grau": "1ª instância",
  "2_grau": "2ª instância",
  superior: "Tribunal superior",
};

export const STATUS_LABELS: Record<ProcessStatus, string> = {
  active: "Em andamento",
  suspended: "Suspenso",
  archived: "Arquivado",
  won: "Ganho",
  lost: "Perdido",
  appeal: "Em recurso",
};
