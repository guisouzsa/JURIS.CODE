"use server";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/lib/auth";
import { supabaseAdmin } from "@/app/lib/supabase";
import type { EventStatus, EventType } from "./types";

export type EventFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return session.user.id;
}

function readEventPayload(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    type: (String(formData.get("type") ?? "compromisso") as EventType),
    event_date: String(formData.get("event_date") ?? ""),
    event_time: String(formData.get("event_time") ?? "") || null,
    location: String(formData.get("location") ?? "").trim() || null,
    client_id: String(formData.get("client_id") ?? "") || null,
    process_id: String(formData.get("process_id") ?? "") || null,
    status: (String(formData.get("status") ?? "scheduled") as EventStatus),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

async function validatePayload(
  payload: ReturnType<typeof readEventPayload>,
  userId: string
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};

  if (!payload.title) {
    errors.title = "O título é obrigatório.";
  }
  if (!payload.event_date) {
    errors.event_date = "A data é obrigatória.";
  }

  if (payload.client_id) {
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("id", payload.client_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!client) errors.client_id = "Cliente inválido.";
  }

  if (payload.process_id) {
    const { data: process } = await supabaseAdmin
      .from("processes")
      .select("id")
      .eq("id", payload.process_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!process) errors.process_id = "Processo inválido.";
  }

  return errors;
}

export async function createEvent(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const userId = await requireUserId();
  const payload = readEventPayload(formData);

  const fieldErrors = await validatePayload(payload, userId);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await supabaseAdmin.from("agenda_events").insert({
    ...payload,
    user_id: userId,
    owner_id: userId,
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    return { error: "Não foi possível salvar o evento. Verifique os dados e tente novamente." };
  }

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  if (payload.client_id) revalidatePath(`/clientes/${payload.client_id}`);
  if (payload.process_id) revalidatePath(`/processos/${payload.process_id}`);
  redirect("/agenda?sucesso=criado");
}

export async function updateEvent(
  eventId: string,
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const userId = await requireUserId();
  const payload = readEventPayload(formData);

  const fieldErrors = await validatePayload(payload, userId);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await supabaseAdmin
    .from("agenda_events")
    .update({ ...payload, updated_by: userId })
    .eq("id", eventId)
    .eq("user_id", userId);

  if (error) {
    return { error: "Não foi possível salvar o evento. Verifique os dados e tente novamente." };
  }

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
  if (payload.client_id) revalidatePath(`/clientes/${payload.client_id}`);
  if (payload.process_id) revalidatePath(`/processos/${payload.process_id}`);
  redirect("/agenda?sucesso=atualizado");
}

export async function setEventStatus(eventId: string, status: EventStatus) {
  const userId = await requireUserId();

  const { error } = await supabaseAdmin
    .from("agenda_events")
    .update({ status, updated_by: userId })
    .eq("id", eventId)
    .eq("user_id", userId);

  if (error) {
    throw new Error("Não foi possível atualizar o status do evento.");
  }

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}

export async function deleteEvent(eventId: string): Promise<{ error?: string } | void> {
  const userId = await requireUserId();

  const { error } = await supabaseAdmin
    .from("agenda_events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", userId);

  if (error) {
    return { error: "Não foi possível excluir o compromisso agora. Tente novamente." };
  }

  revalidatePath("/agenda");
  revalidatePath("/dashboard");
}
