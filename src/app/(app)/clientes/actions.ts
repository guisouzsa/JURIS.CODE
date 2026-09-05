"use server";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/lib/auth";
import { supabaseAdmin } from "@/app/lib/supabase";
import { isValidDocument, isValidEmail, onlyDigits } from "@/app/lib/validators";
import type { ClientSource, ClientStatus, PersonType } from "./types";

export type ClientFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return session.user.id;
}

function readClientPayload(formData: FormData) {
  const personType = formData.get("person_type") as PersonType;
  return {
    person_type: personType,
    full_name: String(formData.get("full_name") ?? "").trim(),
    trade_name: String(formData.get("trade_name") ?? "").trim() || null,
    document_number: onlyDigits(String(formData.get("document_number") ?? "")),
    rg: String(formData.get("rg") ?? "").trim() || null,
    birth_date: String(formData.get("birth_date") ?? "") || null,
    marital_status: String(formData.get("marital_status") ?? "").trim() || null,
    occupation: String(formData.get("occupation") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    secondary_email: String(formData.get("secondary_email") ?? "").trim().toLowerCase() || null,
    phone: onlyDigits(String(formData.get("phone") ?? "")),
    secondary_phone: onlyDigits(String(formData.get("secondary_phone") ?? "")) || null,
    zip_code: onlyDigits(String(formData.get("zip_code") ?? "")) || null,
    street: String(formData.get("street") ?? "").trim() || null,
    address_number: String(formData.get("address_number") ?? "").trim() || null,
    complement: String(formData.get("complement") ?? "").trim() || null,
    neighborhood: String(formData.get("neighborhood") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim() || null,
    state: String(formData.get("state") ?? "").trim().toUpperCase() || null,
    status: (String(formData.get("status") ?? "active") as ClientStatus),
    source: (String(formData.get("source") ?? "") || null) as ClientSource | null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    billing_arrangement: String(formData.get("billing_arrangement") ?? "").trim() || null,
  };
}

function validatePayload(payload: ReturnType<typeof readClientPayload>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!payload.person_type || !["individual", "company"].includes(payload.person_type)) {
    errors.person_type = "Selecione o tipo de cliente.";
  }
  if (!payload.full_name) {
    errors.full_name = payload.person_type === "company" ? "A razão social é obrigatória." : "O nome é obrigatório.";
  }
  if (!payload.document_number) {
    errors.document_number = payload.person_type === "company" ? "O CNPJ é obrigatório." : "O CPF é obrigatório.";
  } else if (payload.person_type && !isValidDocument(payload.document_number, payload.person_type)) {
    errors.document_number = payload.person_type === "company" ? "CNPJ inválido." : "CPF inválido.";
  }
  if (!payload.email && !payload.phone) {
    errors.email = "Informe pelo menos um contato (e-mail ou telefone).";
  }
  if (payload.email && !isValidEmail(payload.email)) {
    errors.email = "Digite um e-mail válido.";
  }
  if (payload.secondary_email && !isValidEmail(payload.secondary_email)) {
    errors.secondary_email = "Digite um e-mail válido.";
  }

  return errors;
}

export async function createClient(
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const userId = await requireUserId();
  const payload = readClientPayload(formData);

  const fieldErrors = validatePayload(payload);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { data: existing } = await supabaseAdmin
    .from("clients")
    .select("id")
    .eq("user_id", userId)
    .eq("document_number", payload.document_number)
    .maybeSingle();

  if (existing) {
    return {
      fieldErrors: {
        document_number:
          payload.person_type === "company" ? "Este CNPJ já está cadastrado." : "Este CPF já está cadastrado.",
      },
    };
  }

  const { data: created, error } = await supabaseAdmin
    .from("clients")
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

  redirect(`/clientes/${created.id}`);
}

export async function updateClient(
  clientId: string,
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const userId = await requireUserId();
  const payload = readClientPayload(formData);

  const fieldErrors = validatePayload(payload);
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { data: existing } = await supabaseAdmin
    .from("clients")
    .select("id")
    .eq("user_id", userId)
    .eq("document_number", payload.document_number)
    .neq("id", clientId)
    .maybeSingle();

  if (existing) {
    return {
      fieldErrors: {
        document_number:
          payload.person_type === "company" ? "Este CNPJ já está cadastrado." : "Este CPF já está cadastrado.",
      },
    };
  }

  const { error } = await supabaseAdmin
    .from("clients")
    .update({ ...payload, updated_by: userId })
    .eq("id", clientId)
    .eq("user_id", userId);

  if (error) {
    return { error: "Não foi possível salvar as informações. Verifique os dados e tente novamente." };
  }

  redirect(`/clientes/${clientId}`);
}

export async function setClientStatus(clientId: string, status: ClientStatus) {
  const userId = await requireUserId();

  const { error } = await supabaseAdmin
    .from("clients")
    .update({ status, updated_by: userId })
    .eq("id", clientId)
    .eq("user_id", userId);

  if (error) {
    throw new Error("Não foi possível atualizar o status do cliente.");
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${clientId}`);
}
