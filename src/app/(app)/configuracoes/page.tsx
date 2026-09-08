import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/lib/auth";
import SignOutButton from "../components/SignOutButton";

const PLAN_STATUS_LABELS: Record<string, string> = {
  trial: "Período de teste",
  active: "Ativo",
  canceled: "Cancelado",
  past_due: "Pagamento pendente",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const planStatusLabel = PLAN_STATUS_LABELS[session.user.planStatus] ?? session.user.planStatus;

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl font-semibold text-primary mb-1">Configurações</h1>
        <p className="font-body-md text-on-surface-variant text-sm">
          Gerencie sua conta, plano e preferências do sistema.
        </p>
      </header>

      <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-primary">Conta</h2>
        <div className="flex items-center justify-between">
          <p className="font-body-md text-on-surface-variant text-sm">Dados pessoais e senha</p>
          <Link
            href="/perfil"
            className="border border-surface-container-high text-primary font-label-caps text-xs px-4 py-2 rounded-sm hover:bg-surface-container transition-colors"
          >
            VER PERFIL
          </Link>
        </div>
      </div>

      <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-primary">Plano</h2>
        <div>
          <p className="font-label-caps text-label-caps text-outline mb-1">Plano atual</p>
          <p className="font-body-md text-primary text-sm capitalize">{session.user.planId ?? "—"}</p>
        </div>
        <div>
          <p className="font-label-caps text-label-caps text-outline mb-1">Status</p>
          <p className="font-body-md text-primary text-sm">{planStatusLabel}</p>
        </div>
      </div>

      <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg p-6 space-y-2">
        <h2 className="text-lg font-semibold text-primary">Notificações</h2>
        <p className="font-body-md text-on-surface-variant text-sm">
          Alertas de prazos e resumo diário por e-mail chegam em breve.
        </p>
      </div>

      <div className="border border-surface-container-high bg-surface-container-lowest rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-primary">Sessão</h2>
        <div className="max-w-[180px]">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
