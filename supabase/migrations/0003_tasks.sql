-- Módulo Tarefas — tabela principal
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  process_id uuid references public.processes(id) on delete set null,

  title text not null,
  description text,
  due_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done', 'canceled')),

  owner_id uuid references public.users(id) on delete set null,

  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_client_id_idx on public.tasks (client_id);
create index if not exists tasks_process_id_idx on public.tasks (process_id);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

alter table public.tasks enable row level security;
-- Nenhuma policy pública: só o service role (usado pelo backend) acessa esta tabela,
-- igual às demais. O isolamento por usuário é feito na aplicação via user_id.
