import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import ClientForm from "../../components/ClientForm";
import FormModal from "../../components/FormModal";
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
    <FormModal title="Editar cliente" subtitle={client.full_name} closeHref={`/clientes/${client.id}`}>
      <ClientForm action={action} initialData={client} submitLabel="SALVAR ALTERAÇÕES" />
    </FormModal>
  );
}
