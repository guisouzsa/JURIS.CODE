"use client";
import { useActionState } from "react";
import Link from "next/link";
import {
  AREA_LABELS,
  INSTANCE_LABELS,
  STATUS_LABELS,
  type LegalProcess,
} from "../types";
import type { ProcessFormState } from "../actions";

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

type ProcessFormProps = {
  action: (prevState: ProcessFormState, formData: FormData) => Promise<ProcessFormState>;
  initialData?: LegalProcess;
  clientOptions: ClientOption[];
  defaultClientId?: string;
  submitLabel: string;
};

export default function ProcessForm({
  action,
  initialData,
  clientOptions,
  defaultClientId,
  submitLabel,
}: ProcessFormProps) {
  const [state, formAction, isPending] = useActionState<ProcessFormState, FormData>(action, {});
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
        <h2 className="text-lg font-semibold text-primary">Identificação</h2>

        <Field label="Cliente" htmlFor="client_id" error={errors.client_id} required>
          <select
            id="client_id"
            name="client_id"
            defaultValue={initialData?.client_id ?? defaultClientId ?? ""}
            className={inputClass}
          >
            <option value="">Selecione um cliente</option>
            {clientOptions.map((client) => (
              <option key={client.id} value={client.id}>{client.full_name}</option>
            ))}
          </select>
        </Field>

        <Field label="Número do processo" htmlFor="process_number" error={errors.process_number}>
          <input
            id="process_number"
            name="process_number"
            type="text"
            defaultValue={initialData?.process_number ?? ""}
            placeholder="0000000-00.0000.0.00.0000"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Área" htmlFor="area" error={errors.area} required>
            <select id="area" name="area" defaultValue={initialData?.area ?? ""} className={inputClass}>
              <option value="">Selecione</option>
              {Object.entries(AREA_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          <Field label="Instância" htmlFor="instance">
            <select id="instance" name="instance" defaultValue={initialData?.instance ?? ""} className={inputClass}>
              <option value="">Selecione</option>
              {Object.entries(INSTANCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Vara / Tribunal" htmlFor="court">
          <input
            id="court"
            name="court"
            type="text"
            defaultValue={initialData?.court ?? ""}
            placeholder="Ex.: 2ª Vara Cível de São Paulo"
            className={inputClass}
          />
        </Field>

        <Field label="Parte contrária" htmlFor="opposing_party">
          <input
            id="opposing_party"
            name="opposing_party"
            type="text"
            defaultValue={initialData?.opposing_party ?? ""}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-5 pt-8 border-t border-surface-container-high">
        <h2 className="text-lg font-semibold text-primary">Detalhes</h2>

        <Field label="Objeto / assunto" htmlFor="subject">
          <textarea
            id="subject"
            name="subject"
            rows={3}
            defaultValue={initialData?.subject ?? ""}
            placeholder="Descreva brevemente o que está sendo discutido neste processo..."
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Valor da causa" htmlFor="case_value">
            <input
              id="case_value"
              name="case_value"
              type="text"
              inputMode="decimal"
              defaultValue={initialData?.case_value ?? ""}
              placeholder="0,00"
              className={inputClass}
            />
          </Field>

          <Field label="Data de distribuição" htmlFor="distribution_date">
            <input
              id="distribution_date"
              name="distribution_date"
              type="date"
              defaultValue={initialData?.distribution_date ?? ""}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-5 pt-8 border-t border-surface-container-high">
        <h2 className="text-lg font-semibold text-primary">Gestão interna</h2>

        <Field label="Status" htmlFor="status">
          <select id="status" name="status" defaultValue={initialData?.status ?? "active"} className={inputClass}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>

        <Field label="Observações" htmlFor="notes">
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={initialData?.notes ?? ""}
            placeholder="Adicione informações relevantes sobre este processo..."
            className={inputClass}
          />
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
        <Link href="/processos" className="font-body-md text-on-surface-variant hover:text-primary transition-colors text-sm">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
