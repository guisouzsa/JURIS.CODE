"use server";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/lib/auth";
import { supabaseAdmin } from "@/app/lib/supabase";
import type { ProcessArea, ProcessInstance, ProcessStatus } from "./types";

export type ProcessFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return session.user.id;
}

function readProcessPayload(formData: FormData) {
  const rawValue = String(formData.get("case_value") ?? "").replace(/\./g, "").replace(",", ".");
  const caseValue = rawValue ? Number(rawValue) : null;

  return {
    client_id: String(formData.get("client_id") ?? ""),
    process_number: String(formData.get("process_number") ?? "").trim() || null,
    area: String(formData.get("area") ?? "") as ProcessArea,
    instance: (String(formData.get("instance") ?? "") || null) as ProcessInstance | null,
    court: String(formData.get("court") ?? "").trim() || null,
    opposing_party: String(formData.get("opposing_party") ?? "").trim() || null,
    subject: String(formData.get("subject") ?? "").trim() || null,
    case_value: caseValue !== null && !Number.isNaN(caseValue) ? caseValue : null,
    distribution_date: String(formData.get("distribution_date") ?? "") || null,
    status: (String(formData.get("status") ?? "active") as ProcessStatus),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };
}

const VALID_AREAS: ProcessArea[] = [
  "civil", "trabalhista", "tributario", "criminal", "familia",
  "previdenciario", "empresarial", "consumidor", "administrativo", "outro",
];

async function validatePayload(
  payload: ReturnType<typeof readProcessPayload>,
  userId: string
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};

  if (!payload.client_id) {
    errors.client_id = "Selecione o cliente responsável por este processo.";
  } else {
    const { data: client } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("id", payload.client_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!client) errors.client_id = "Cliente inválido.";
  }

  if (!payload.area || !VALID_AREAS.includes(payload.area)) {
    errors.area = "Selecione a área do processo.";
  }

  return errors;
}

export async function createProcess(
  _prevState: ProcessFormState,
  formData: FormData
): Promise<ProcessFormState> {
  const userId = await requireUserId();
  const payload = readProcessPayload(formData);

  const fieldErrors = await validatePayload(payload, userId);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  if (payload.process_number) {
    const { data: existing } = await supabaseAdmin
      .from("processes")
      .select("id")
      .eq("user_id", userId)
      .eq("process_number", payload.process_number)
      .maybeSingle();

    if (existing) {
      return { fieldErrors: { process_number: "Este número de processo já está cadastrado." } };
    }
  }

  const { data: created, error } = await supabaseAdmin
    .from("processes")
    .insert({
      ...payload,
      user_id: userId,
      owner_id: userId,
      created_by: userId,
      updated_by: userId,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { error: "Não foi possível salvar as informações. Verifique os dados e tente novamente." };
  }

  revalidatePath("/processos");
  revalidatePath(`/clientes/${payload.client_id}`);
  redirect(`/processos/${created.id}`);
}

export async function updateProcess(
  processId: string,
  _prevState: ProcessFormState,
  formData: FormData
): Promise<ProcessFormState> {
  const userId = await requireUserId();
  const payload = readProcessPayload(formData);

  const fieldErrors = await validatePayload(payload, userId);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  if (payload.process_number) {
    const { data: existing } = await supabaseAdmin
      .from("processes")
      .select("id")
      .eq("user_id", userId)
      .eq("process_number", payload.process_number)
      .neq("id", processId)
      .maybeSingle();

    if (existing) {
      return { fieldErrors: { process_number: "Este número de processo já está cadastrado." } };
    }
  }

  const { error } = await supabaseAdmin
    .from("processes")
    .update({ ...payload, updated_by: userId })
    .eq("id", processId)
    .eq("user_id", userId);

  if (error) {
    return { error: "Não foi possível salvar as informações. Verifique os dados e tente novamente." };
  }

  revalidatePath("/processos");
  revalidatePath(`/processos/${processId}`);
  revalidatePath(`/clientes/${payload.client_id}`);
  redirect(`/processos/${processId}`);
}

export async function setProcessStatus(processId: string, status: ProcessStatus) {
  const userId = await requireUserId();

  const { data: process, error } = await supabaseAdmin
    .from("processes")
    .update({ status, updated_by: userId })
    .eq("id", processId)
    .eq("user_id", userId)
    .select("client_id")
    .single();

  if (error || !process) {
    throw new Error("Não foi possível atualizar o status do processo.");
  }

  revalidatePath("/processos");
  revalidatePath(`/processos/${processId}`);
  revalidatePath(`/clientes/${process.client_id}`);
}
