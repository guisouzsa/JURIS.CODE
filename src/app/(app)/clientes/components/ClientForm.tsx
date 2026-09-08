"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import {
  formatCEP,
  formatDocument,
  formatPhone,
  onlyDigits,
} from "@/app/lib/validators";
import {
  MARITAL_STATUS_OPTIONS,
  SOURCE_LABELS,
  STATUS_LABELS,
  type Client,
  type PersonType,
} from "../types";
import type { ClientFormState } from "../actions";

const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

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

type ClientFormProps = {
  action: (prevState: ClientFormState, formData: FormData) => Promise<ClientFormState>;
  initialData?: Client;
  submitLabel: string;
};

export default function ClientForm({ action, initialData, submitLabel }: ClientFormProps) {
  const [state, formAction, isPending] = useActionState<ClientFormState, FormData>(action, {});
  const [personType, setPersonType] = useState<PersonType>(initialData?.person_type ?? "individual");
  const [values, setValues] = useState({
    document_number: initialData?.document_number ?? "",
    phone: initialData?.phone ?? "",
    secondary_phone: initialData?.secondary_phone ?? "",
    zip_code: initialData?.zip_code ?? "",
    street: initialData?.street ?? "",
    neighborhood: initialData?.neighborhood ?? "",
    city: initialData?.city ?? "",
    state: initialData?.state ?? "",
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

  const isCompany = personType === "company";
  const errors = state.fieldErrors ?? {};

  function update<K extends keyof typeof values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCepLookup() {
    const digits = onlyDigits(values.zip_code);
    if (digits.length !== 8) {
      setCepError("Digite um CEP com 8 dígitos.");
      return;
    }
    setCepError("");
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado.");
        return;
      }
      setValues((prev) => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));
    } catch {
      setCepError("Não foi possível buscar o endereço agora.");
    } finally {
      setCepLoading(false);
    }
  }

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

        <Field label="Tipo de cliente" htmlFor="person_type" error={errors.person_type} required>
          <select
            id="person_type"
            name="person_type"
            value={personType}
            onChange={(e) => setPersonType(e.target.value as PersonType)}
            className={inputClass}
          >
            <option value="individual">Pessoa física</option>
            <option value="company">Pessoa jurídica</option>
          </select>
        </Field>

        <Field
          label={isCompany ? "Razão social" : "Nome completo"}
          htmlFor="full_name"
          error={errors.full_name}
          required
        >
          <input
            id="full_name"
            name="full_name"
            type="text"
            defaultValue={initialData?.full_name}
            placeholder={isCompany ? "Digite a razão social" : "Digite o nome completo"}
            className={inputClass}
          />
        </Field>

        {isCompany && (
          <Field label="Nome fantasia" htmlFor="trade_name">
            <input
              id="trade_name"
              name="trade_name"
              type="text"
              defaultValue={initialData?.trade_name ?? ""}
              placeholder="Digite o nome fantasia"
              className={inputClass}
            />
          </Field>
        )}

        <Field label={isCompany ? "CNPJ" : "CPF"} htmlFor="document_number" error={errors.document_number} required>
          <input
            id="document_number"
            name="document_number"
            type="text"
            inputMode="numeric"
            value={formatDocument(values.document_number, personType)}
            onChange={(e) => update("document_number", onlyDigits(e.target.value))}
            placeholder={isCompany ? "00.000.000/0000-00" : "000.000.000-00"}
            className={inputClass}
          />
        </Field>

        {!isCompany && (
          <>
            <Field label="RG" htmlFor="rg">
              <input
                id="rg"
                name="rg"
                type="text"
                defaultValue={initialData?.rg ?? ""}
                placeholder="Digite o RG"
                className={inputClass}
              />
            </Field>
            <Field label="Estado civil" htmlFor="marital_status">
              <select id="marital_status" name="marital_status" defaultValue={initialData?.marital_status ?? ""} className={inputClass}>
                <option value="">Selecione</option>
                {MARITAL_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label="Profissão" htmlFor="occupation">
              <input
                id="occupation"
                name="occupation"
                type="text"
                defaultValue={initialData?.occupation ?? ""}
                placeholder="Digite a profissão"
                className={inputClass}
              />
            </Field>
          </>
        )}

        <Field label={isCompany ? "Data de fundação" : "Data de nascimento"} htmlFor="birth_date">
          <input
            id="birth_date"
            name="birth_date"
            type="date"
            defaultValue={initialData?.birth_date ?? ""}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-5 pt-8 border-t border-surface-container-high">
        <h2 className="text-lg font-semibold text-primary">Contato</h2>
        <p className="font-body-md text-on-surface-variant text-xs -mt-3">
          Informe ao menos um contato: e-mail ou telefone.
        </p>

        <Field label="E-mail" htmlFor="email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={initialData?.email ?? ""}
            placeholder="cliente@email.com"
            className={inputClass}
          />
        </Field>

        <Field label="E-mail secundário" htmlFor="secondary_email" error={errors.secondary_email}>
          <input
            id="secondary_email"
            name="secondary_email"
            type="email"
            defaultValue={initialData?.secondary_email ?? ""}
            placeholder="cliente@email.com"
            className={inputClass}
          />
        </Field>

        <Field label="Telefone" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            type="text"
            inputMode="numeric"
            value={formatPhone(values.phone)}
            onChange={(e) => update("phone", onlyDigits(e.target.value))}
            placeholder="(00) 00000-0000"
            className={inputClass}
          />
        </Field>

        <Field label="Telefone secundário/WhatsApp" htmlFor="secondary_phone">
          <input
            id="secondary_phone"
            name="secondary_phone"
            type="text"
            inputMode="numeric"
            value={formatPhone(values.secondary_phone)}
            onChange={(e) => update("secondary_phone", onlyDigits(e.target.value))}
            placeholder="(00) 00000-0000"
            className={inputClass}
          />
        </Field>
      </section>

      <section className="space-y-5 pt-8 border-t border-surface-container-high">
        <h2 className="text-lg font-semibold text-primary">Endereço</h2>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Field label="CEP" htmlFor="zip_code" error={cepError}>
              <input
                id="zip_code"
                name="zip_code"
                type="text"
                inputMode="numeric"
                value={formatCEP(values.zip_code)}
                onChange={(e) => update("zip_code", onlyDigits(e.target.value))}
                placeholder="00000-000"
                className={inputClass}
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={handleCepLookup}
            disabled={cepLoading}
            className="shrink-0 border border-surface-container-high text-primary font-label-caps text-xs px-4 py-2.5 rounded-md hover:bg-surface-container transition-colors disabled:opacity-60"
          >
            {cepLoading ? "BUSCANDO..." : "BUSCAR ENDEREÇO"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Field label="Rua" htmlFor="street">
              <input
                id="street"
                name="street"
                type="text"
                value={values.street}
                onChange={(e) => update("street", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Número" htmlFor="address_number">
            <input
              id="address_number"
              name="address_number"
              type="text"
              defaultValue={initialData?.address_number ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Complemento" htmlFor="complement">
            <input
              id="complement"
              name="complement"
              type="text"
              defaultValue={initialData?.complement ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Bairro" htmlFor="neighborhood">
            <input
              id="neighborhood"
              name="neighborhood"
              type="text"
              value={values.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Field label="Cidade" htmlFor="city">
              <input
                id="city"
                name="city"
                type="text"
                value={values.city}
                onChange={(e) => update("city", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="UF" htmlFor="state">
            <select
              id="state"
              name="state"
              value={values.state}
              onChange={(e) => update("state", e.target.value)}
              className={inputClass}
            >
              <option value="">--</option>
              {BRAZIL_STATES.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
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

        <Field label="Origem do cliente" htmlFor="source">
          <select id="source" name="source" defaultValue={initialData?.source ?? ""} className={inputClass}>
            <option value="">Selecione</option>
            {Object.entries(SOURCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>

        <Field label="Forma de cobrança combinada" htmlFor="billing_arrangement">
          <input
            id="billing_arrangement"
            name="billing_arrangement"
            type="text"
            defaultValue={initialData?.billing_arrangement ?? ""}
            placeholder="Ex.: Honorário fixo, êxito, hora, contrato..."
            className={inputClass}
          />
        </Field>

        <Field label="Observações" htmlFor="notes">
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={initialData?.notes ?? ""}
            placeholder="Adicione informações relevantes sobre este cliente..."
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
        <Link href="/clientes" className="font-body-md text-on-surface-variant hover:text-primary transition-colors text-sm">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
