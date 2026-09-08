import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import AssistantChat from "./components/AssistantChat";
import NewConversationButton from "./components/NewConversationButton";

export default async function AssistantPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-start justify-between gap-4 mb-4 flex-wrap shrink-0">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold text-primary">Assistente IA</h1>
          <p className="font-body-md text-on-surface-variant text-sm max-w-xl">
            Converse sobre seus clientes, processos, tarefas e agenda.
          </p>
        </div>
        <NewConversationButton />
      </header>

      <AssistantChat />
    </div>
  );
}
