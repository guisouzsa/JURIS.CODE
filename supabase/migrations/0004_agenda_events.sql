-- Módulo Agenda — compromissos e audiências (prazos vêm de tasks.due_date, sem duplicar dados)
create table if not exists public.agenda_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  process_id uuid references public.processes(id) on delete set null,

  title text not null,
  type text not null default 'compromisso' check (type in ('compromisso', 'audiencia')),
  event_date date not null,
  event_time time,
  location text,
  status text not null default 'scheduled' check (status in ('scheduled', 'done', 'canceled')),
  notes text,

  owner_id uuid references public.users(id) on delete set null,

  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists agenda_events_user_id_idx on public.agenda_events (user_id);
create index if not exists agenda_events_client_id_idx on public.agenda_events (client_id);
create index if not exists agenda_events_process_id_idx on public.agenda_events (process_id);
create index if not exists agenda_events_event_date_idx on public.agenda_events (event_date);

drop trigger if exists agenda_events_set_updated_at on public.agenda_events;
create trigger agenda_events_set_updated_at
  before update on public.agenda_events
  for each row
  execute function public.set_updated_at();

alter table public.agenda_events enable row level security;
-- Nenhuma policy pública: só o service role (usado pelo backend) acessa esta tabela,
-- igual às demais. O isolamento por usuário é feito na aplicação via user_id.
