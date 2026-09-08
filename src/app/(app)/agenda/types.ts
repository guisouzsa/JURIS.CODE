export type EventType = "compromisso" | "audiencia";
export type EventStatus = "scheduled" | "done" | "canceled";

export interface AgendaEvent {
  id: string;
  user_id: string;
  client_id: string | null;
  process_id: string | null;
  title: string;
  type: EventType;
  event_date: string;
  event_time: string | null;
  location: string | null;
  status: EventStatus;
  notes: string | null;
  owner_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export type AgendaEventWithRelations = AgendaEvent & {
  client_full_name: string | null;
  process_number: string | null;
};

export const TYPE_LABELS: Record<EventType, string> = {
  compromisso: "Compromisso",
  audiencia: "Audiência",
};

export const STATUS_LABELS: Record<EventStatus, string> = {
  scheduled: "Agendado",
  done: "Realizado",
  canceled: "Cancelado",
};

export type AgendaItem =
  | (AgendaEventWithRelations & { kind: "event" })
  | {
      kind: "task";
      id: string;
      title: string;
      event_date: string;
      event_time: null;
      client_full_name: string | null;
      process_number: string | null;
      priority: "low" | "medium" | "high";
    };
