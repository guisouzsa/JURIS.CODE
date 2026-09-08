"use server";

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { authOptions } from "@/app/lib/auth";
import { supabaseAdmin } from "@/app/lib/supabase";

export type PasswordFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

export async function changePassword(
  _prevState: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const currentPassword = String(formData.get("current_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!currentPassword) fieldErrors.current_password = "Digite sua senha atual.";
  if (!newPassword || newPassword.length < 8) {
    fieldErrors.new_password = "A nova senha deve ter pelo menos 8 caracteres.";
  }
  if (newPassword && newPassword !== confirmPassword) {
    fieldErrors.confirm_password = "As senhas não coincidem.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("password_hash")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!user) {
    return { error: "Não foi possível localizar sua conta agora." };
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isCurrentValid) {
    return { fieldErrors: { current_password: "Senha atual incorreta." } };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  const { error } = await supabaseAdmin
    .from("users")
    .update({ password_hash: newHash })
    .eq("id", session.user.id);

  if (error) {
    return { error: "Não foi possível atualizar a senha agora. Tente novamente." };
  }

  return { success: "Senha atualizada com sucesso." };
}
