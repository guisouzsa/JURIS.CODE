import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import ClientForm from "../../components/ClientForm";
import { getClient } from "../../data";
import { updateClient } from "../../actions";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const client = await getClient(id, session.user.id);
  if (!client) notFound();

  const action = updateClient.bind(null, client.id);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-primary mb-1">Editar cliente</h1>
        <p className="font-body-md text-on-surface-variant text-sm">{client.full_name}</p>
      </header>

      <ClientForm action={action} initialData={client} submitLabel="SALVAR ALTERAÇÕES" />
    </div>
  );
}
