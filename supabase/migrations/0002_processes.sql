-- Módulo Processos — tabela principal
create table if not exists public.processes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,

  -- Identificação
  process_number text,
  area text not null check (
    area in (
      'civil', 'trabalhista', 'tributario', 'criminal',
      'familia', 'previdenciario', 'empresarial', 'consumidor',
      'administrativo', 'outro'
    )
  ),
  instance text check (instance in ('1_grau', '2_grau', 'superior')),
  court text,
  opposing_party text,
  subject text,
  case_value numeric(14, 2),
  distribution_date date,

  -- Gestão interna
  status text not null default 'active' check (
    status in ('active', 'suspended', 'archived', 'won', 'lost', 'appeal')
  ),
  owner_id uuid references public.users(id) on delete set null,
  notes text,

  -- Auditoria
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists processes_user_id_idx on public.processes (user_id);
create index if not exists processes_client_id_idx on public.processes (client_id);
create index if not exists processes_status_idx on public.processes (status);

create unique index if not exists processes_user_number_unique
  on public.processes (user_id, process_number)
  where process_number is not null and process_number <> '';

drop trigger if exists processes_set_updated_at on public.processes;
create trigger processes_set_updated_at
  before update on public.processes
  for each row
  execute function public.set_updated_at();

alter table public.processes enable row level security;
-- Nenhuma policy pública: só o service role (usado pelo backend) acessa esta tabela,
-- igual às tabelas "users" e "clients". O isolamento por usuário é feito na aplicação via user_id.
