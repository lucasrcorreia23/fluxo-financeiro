-- Fluxo — schema (personal single-user finance app)
-- Run in Supabase SQL Editor. RLS left open for personal single-user use;
-- flip to auth (magic link) later and scope by auth.uid().

-- PERFIL / CONFIGURAÇÕES
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  monthly_income numeric(12,2) default 0,
  currency text default 'BRL',
  onboarded boolean default false,
  created_at timestamptz default now()
);

-- CATEGORIAS
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gradient text not null,          -- ex: 'from-indigo-500 to-violet-600'
  accent text not null,            -- ex: 'indigo'
  icon text not null,              -- ex: 'home'
  created_at timestamptz default now()
);

-- GASTOS (fixos e variáveis)
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  amount numeric(12,2),            -- null = ainda não preenchido (ex: Luz)
  type text not null check (type in ('fixed','variable')),
  category_id uuid references categories(id) on delete set null,
  due_day int,                     -- dia do vencimento (1-31), opcional
  is_paid boolean default false,
  owner text,                      -- ex: 'Lucas' | 'Vanessa'
  created_at timestamptz default now()
);

-- HISTÓRICO MENSAL (snapshot p/ insights)
create table if not exists monthly_history (
  id uuid primary key default gen_random_uuid(),
  month date not null,             -- primeiro dia do mês
  category_id uuid references categories(id) on delete set null,
  total numeric(12,2) not null default 0,
  created_at timestamptz default now(),
  unique (month, category_id)
);

-- METAS
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_amount numeric(12,2) not null,
  current_amount numeric(12,2) default 0,
  deadline date,
  color text,
  created_at timestamptz default now()
);

-- LISTA DE DESEJOS + AGENDAMENTO DE COMPRA
create table if not exists wishlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2),
  product_url text,
  image_url text,
  priority int default 2,          -- 1 alta, 2 média, 3 baixa
  alert_date date,                 -- "me alerte no dia X"
  notified boolean default false,
  status text default 'wanted' check (status in ('wanted','purchased')),
  purchased_at timestamptz,
  category_id uuid references categories(id) on delete set null,
  created_at timestamptz default now()
);

-- Uso pessoal: RLS aberto (habilite auth depois).
alter table profile enable row level security;
alter table categories enable row level security;
alter table expenses enable row level security;
alter table monthly_history enable row level security;
alter table goals enable row level security;
alter table wishlist enable row level security;

do $$
declare t text;
begin
  foreach t in array array['profile','categories','expenses','monthly_history','goals','wishlist']
  loop
    execute format(
      'create policy "public access" on %I for all using (true) with check (true);', t
    );
  end loop;
end $$;
