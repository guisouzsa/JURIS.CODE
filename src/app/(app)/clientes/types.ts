export type PersonType = "individual" | "company";
export type ClientStatus = "active" | "inactive" | "prospect" | "former";
export type ClientSource = "referral" | "website" | "social_media" | "partner_firm" | "other";

export interface Client {
  id: string;
  user_id: string;
  person_type: PersonType;
  full_name: string;
  trade_name: string | null;
  document_number: string;
  rg: string | null;
  birth_date: string | null;
  marital_status: string | null;
  occupation: string | null;
  email: string;
  secondary_email: string | null;
  phone: string;
  secondary_phone: string | null;
  zip_code: string | null;
  street: string | null;
  address_number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  status: ClientStatus;
  owner_id: string | null;
  source: ClientSource | null;
  notes: string | null;
  billing_arrangement: string | null;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  prospect: "Prospect",
  former: "Ex-cliente",
};

export const SOURCE_LABELS: Record<ClientSource, string> = {
  referral: "Indicação",
  website: "Site",
  social_media: "Redes sociais",
  partner_firm: "Escritório parceiro",
  other: "Outro",
};

export const MARITAL_STATUS_OPTIONS = [
  "Solteiro(a)",
  "Casado(a)",
  "Divorciado(a)",
  "Viúvo(a)",
  "União estável",
];
