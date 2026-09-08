"use server";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/lib/auth";
import { supabaseAdmin } from "@/app/lib/supabase";
import type { TaskPriority, TaskStatus } from "./types";

export type TaskFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return session.user.id;
}

function readTaskPayload(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    client_id: String(formData.get("client_id") ?? "") || null,
    process_id: String(formData.get("process_id") ?? "") || null,
    due_date: String(formData.get("due_date") ?? "") || null,
    priority: (String(formData.get("priority") ?? "medium") as TaskPriority),
    status: (String(formData.get("status") ?? "pending") as TaskStatus),
  };
}

async function validatePayload(
  payload: ReturnType<typeof readTaskPayload>,
  userId: string
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};

  if (!payload.title) {
    errors.title = "O título da tarefa é obrigatório.";
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

export async function createTask(
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const userId = await requireUserId();
  const payload = readTaskPayload(formData);

  const fieldErrors = await validatePayload(payload, userId);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await supabaseAdmin.from("tasks").insert({
    ...payload,
    user_id: userId,
    owner_id: userId,
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    return { error: "Não foi possível salvar a tarefa. Verifique os dados e tente novamente." };
  }

  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
  if (payload.client_id) revalidatePath(`/clientes/${payload.client_id}`);
  if (payload.process_id) revalidatePath(`/processos/${payload.process_id}`);
  redirect("/tarefas?sucesso=criado");
}

export async function updateTask(
  taskId: string,
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const userId = await requireUserId();
  const payload = readTaskPayload(formData);

  const fieldErrors = await validatePayload(payload, userId);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await supabaseAdmin
    .from("tasks")
    .update({ ...payload, updated_by: userId })
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) {
    return { error: "Não foi possível salvar a tarefa. Verifique os dados e tente novamente." };
  }

  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
  if (payload.client_id) revalidatePath(`/clientes/${payload.client_id}`);
  if (payload.process_id) revalidatePath(`/processos/${payload.process_id}`);
  redirect("/tarefas?sucesso=atualizado");
}

export async function setTaskStatus(taskId: string, status: TaskStatus) {
  const userId = await requireUserId();

  const { error } = await supabaseAdmin
    .from("tasks")
    .update({ status, updated_by: userId })
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) {
    throw new Error("Não foi possível atualizar o status da tarefa.");
  }

  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
}

export async function deleteTask(taskId: string): Promise<{ error?: string } | void> {
  const userId = await requireUserId();

  const { error } = await supabaseAdmin
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) {
    return { error: "Não foi possível excluir a tarefa agora. Tente novamente." };
  }

  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
}
