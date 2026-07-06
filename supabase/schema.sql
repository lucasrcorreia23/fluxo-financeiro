-- Fluxo — schema (household finance, 2 members: Lucas & Vanessa)
--
-- Dados são escopados por `member` (a pessoa dona: 'Lucas' | 'Vanessa'), não por
-- auth.uid(). As duas contas autenticadas compartilham leitura E escrita de tudo
-- (casal), então a RLS libera acesso a qualquer usuário logado.
--
-- IDs são `text` gerados no cliente (crypto.randomUUID) e category_id guarda o id
-- de categoria code-owned (ex: 'cat-moradia'), por isso não há FK para categories.
--
-- Rode este arquivo inteiro no Supabase → SQL Editor.

-- PERFIL / RENDA — uma linha por pessoa
create table if not exists profiles (
  member text primary key check (member in ('Lucas', 'Vanessa')),
  monthly_income numeric(12, 2) not null default 0,
  currency text not null default 'BRL',
  onboarded boolean not null default false,
  updated_at timestamptz not null default now()
);

-- GASTOS (fixos e variáveis)
create table if not exists expenses (
  id text primary key,
  member text not null check (member in ('Lucas', 'Vanessa')),
  name text not null,
  amount numeric(12, 2),               -- null = ainda não preenchido (ex: Luz)
  type text not null check (type in ('fixed', 'variable')),
  category_id text,                    -- id code-owned, ex: 'cat-moradia'
  due_day int,                         -- 1-31, opcional
  is_paid boolean not null default false,
  owner text,                          -- responsável no casal, opcional
  created_at timestamptz not null default now()
);

-- METAS
create table if not exists goals (
  id text primary key,
  member text not null check (member in ('Lucas', 'Vanessa')),
  name text not null,
  target_amount numeric(12, 2) not null,
  current_amount numeric(12, 2) not null default 0,
  deadline date,
  color text,
  created_at timestamptz not null default now()
);

-- LISTA DE DESEJOS
create table if not exists wishlist (
  id text primary key,
  member text not null check (member in ('Lucas', 'Vanessa')),
  name text not null,
  price numeric(12, 2),
  product_url text,
  image_url text,
  priority int not null default 2,     -- 1 alta, 2 média, 3 baixa
  alert_date date,
  notified boolean not null default false,
  status text not null default 'wanted' check (status in ('wanted', 'purchased')),
  purchased_at timestamptz,
  category_id text,
  created_at timestamptz not null default now()
);

-- HISTÓRICO MENSAL (snapshot p/ insights de tendência)
create table if not exists monthly_history (
  id text primary key,
  member text not null check (member in ('Lucas', 'Vanessa')),
  month date not null,                 -- primeiro dia do mês
  category_id text,
  total numeric(12, 2) not null default 0
);

create index if not exists idx_expenses_member on expenses (member);
create index if not exists idx_goals_member on goals (member);
create index if not exists idx_wishlist_member on wishlist (member);
create index if not exists idx_history_member on monthly_history (member);

-- RLS — casa compartilhada: qualquer usuário autenticado lê e escreve tudo.
alter table profiles enable row level security;
alter table expenses enable row level security;
alter table goals enable row level security;
alter table wishlist enable row level security;
alter table monthly_history enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'expenses', 'goals', 'wishlist', 'monthly_history']
  loop
    execute format('drop policy if exists "shared access" on %I;', t);
    execute format(
      'create policy "shared access" on %I for all to authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
