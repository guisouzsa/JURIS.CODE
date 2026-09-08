import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import { supabaseAdmin } from "@/app/lib/supabase";
import ChangePasswordForm from "./components/ChangePasswordForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("name, email")
    .eq("id", session.user.id)
    .maybeSingle();

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl font-semibold text-primary mb-1">Perfil</h1>
        <p className="font-body-md text-on-surface-variant text-sm">Suas informações de conta.</p>
      </header>

      <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg p-6 space-y-4">
        <div>
          <p className="font-label-caps text-label-caps text-outline mb-1">Nome</p>
          <p className="font-body-md text-primary text-sm">{user?.name ?? "—"}</p>
        </div>
        <div>
          <p className="font-label-caps text-label-caps text-outline mb-1">E-mail</p>
          <p className="font-body-md text-primary text-sm">{user?.email ?? "—"}</p>
        </div>
      </div>

      <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Alterar senha</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
