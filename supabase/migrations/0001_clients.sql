-- Módulo Clientes — tabela principal
create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,

  -- Identificação
  person_type text not null check (person_type in ('individual', 'company')),
  full_name text not null,
  trade_name text,
  document_number text not null,
  rg text,
  birth_date date,
  marital_status text,
  occupation text,

  -- Contato
  email text not null,
  secondary_email text,
  phone text not null,
  secondary_phone text,

  -- Endereço
  zip_code text,
  street text,
  address_number text,
  complement text,
  neighborhood text,
  city text,
  state text,

  -- Gestão interna
  status text not null default 'active' check (status in ('active', 'inactive', 'prospect', 'former')),
  owner_id uuid references public.users(id) on delete set null,
  source text check (source in ('referral', 'website', 'social_media', 'partner_firm', 'other')),
  notes text,
  billing_arrangement text,

  -- Auditoria
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now(),

  constraint clients_user_document_unique unique (user_id, document_number)
);

create index if not exists clients_user_id_idx on public.clients (user_id);
create index if not exists clients_status_idx on public.clients (status);
create index if not exists clients_full_name_idx on public.clients (full_name);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row
  execute function public.set_updated_at();

alter table public.clients enable row level security;
-- Nenhuma policy pública: só o service role (usado pelo backend) acessa esta tabela,
-- igual à tabela "users". O isolamento por usuário é feito na aplicação via user_id.
