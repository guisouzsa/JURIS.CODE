"use client";
import { useActionState } from "react";
import Link from "next/link";
import { PRIORITY_LABELS, STATUS_LABELS, type TaskWithRelations } from "../types";
import type { TaskFormState } from "../actions";

const inputClass =
  "w-full bg-surface-container border border-surface-container-high rounded-md px-4 py-2.5 font-body-md text-primary placeholder:text-outline focus:outline-none focus:border-accent-gray transition-colors text-sm";

function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="font-label-caps text-label-caps text-on-surface-variant block mb-1.5">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-error text-sm mt-1.5">{error}</p>}
    </div>
  );
}

type ClientOption = { id: string; full_name: string };
type ProcessOption = { id: string; process_number: string | null; client_full_name: string };

type TaskFormProps = {
  action: (prevState: TaskFormState, formData: FormData) => Promise<TaskFormState>;
  initialData?: TaskWithRelations;
  clientOptions: ClientOption[];
  processOptions: ProcessOption[];
  defaultClientId?: string;
  defaultProcessId?: string;
  submitLabel: string;
};

export default function TaskForm({
  action,
  initialData,
  clientOptions,
  processOptions,
  defaultClientId,
  defaultProcessId,
  submitLabel,
}: TaskFormProps) {
  const [state, formAction, isPending] = useActionState<TaskFormState, FormData>(action, {});
  const errors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="space-y-10 border border-surface-container-high bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-2xl ambient-glow"
    >
      {state.error && (
        <div className="border border-surface-container-high bg-surface-container rounded-md px-4 py-3">
          <p className="font-body-md text-primary text-sm">{state.error}</p>
        </div>
      )}

      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-primary">Tarefa</h2>

        <Field label="Título" htmlFor="title" error={errors.title} required>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={initialData?.title ?? ""}
            placeholder="Ex.: Revisar documentação"
            className={inputClass}
          />
        </Field>

        <Field label="Descrição" htmlFor="description">
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initialData?.description ?? ""}
            placeholder="Detalhes sobre o que precisa ser feito..."
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Cliente" htmlFor="client_id" error={errors.client_id}>
            <select
              id="client_id"
              name="client_id"
              defaultValue={initialData?.client_id ?? defaultClientId ?? ""}
              className={inputClass}
            >
              <option value="">Nenhum</option>
              {clientOptions.map((client) => (
                <option key={client.id} value={client.id}>{client.full_name}</option>
              ))}
            </select>
          </Field>

          <Field label="Processo" htmlFor="process_id" error={errors.process_id}>
            <select
              id="process_id"
              name="process_id"
              defaultValue={initialData?.process_id ?? defaultProcessId ?? ""}
              className={inputClass}
            >
              <option value="">Nenhum</option>
              {processOptions.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.process_number || "Sem número"} — {process.client_full_name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="space-y-5 pt-8 border-t border-surface-container-high">
        <h2 className="text-lg font-semibold text-primary">Gestão</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prazo" htmlFor="due_date">
            <input
              id="due_date"
              name="due_date"
              type="date"
              defaultValue={initialData?.due_date ?? ""}
              className={inputClass}
            />
          </Field>

          <Field label="Prioridade" htmlFor="priority">
            <select id="priority" name="priority" defaultValue={initialData?.priority ?? "medium"} className={inputClass}>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Status" htmlFor="status">
          <select id="status" name="status" defaultValue={initialData?.status ?? "pending"} className={inputClass}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
      </section>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-background font-label-caps text-label-caps px-8 py-3 hover:bg-secondary transition-colors rounded-sm disabled:opacity-60"
        >
          {isPending ? "SALVANDO..." : submitLabel}
        </button>
        <Link href="/tarefas" className="font-body-md text-on-surface-variant hover:text-primary transition-colors text-sm">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
