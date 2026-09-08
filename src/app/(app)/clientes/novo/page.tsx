import ClientForm from "../components/ClientForm";
import FormModal from "../components/FormModal";
import { createClient } from "../actions";

export default function NewClientPage() {
  return (
    <FormModal
      title="Novo cliente"
      subtitle="Cadastre um cliente e comece a acompanhar seus processos, tarefas e documentos."
      closeHref="/clientes"
    >
      <ClientForm action={createClient} submitLabel="SALVAR CLIENTE" />
    </FormModal>
  );
}
