import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import AssistantChat from "./components/AssistantChat";

export default async function AssistantPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-primary mb-1">Assistente IA</h1>
        <p className="font-body-md text-on-surface-variant text-sm">
          Converse com o assistente sobre seus clientes, processos, tarefas e agenda.
        </p>
      </header>

      <AssistantChat />
    </div>
  );
}
