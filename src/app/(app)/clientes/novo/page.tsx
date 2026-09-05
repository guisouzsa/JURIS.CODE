import ClientForm from "../components/ClientForm";
import { createClient } from "../actions";

export default function NewClientPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-primary mb-1">Novo cliente</h1>
        <p className="font-body-md text-on-surface-variant text-sm">
          Cadastre um cliente e comece a acompanhar seus processos, tarefas e documentos.
        </p>
      </header>

      <ClientForm action={createClient} submitLabel="SALVAR CLIENTE" />
    </div>
  );
}
