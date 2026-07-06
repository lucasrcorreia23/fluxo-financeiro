-- Fluxo — seed data. Run after schema.sql.

insert into profile (monthly_income, currency, onboarded) values (0, 'BRL', false);

-- Categorias (gradientes/ícones da direção visual)
insert into categories (id, name, gradient, accent, icon) values
  (gen_random_uuid(), 'Moradia',            'from-indigo-500 to-violet-600',  'indigo',  'home'),
  (gen_random_uuid(), 'Utilidades',         'from-amber-400 to-orange-600',   'amber',   'zap'),
  (gen_random_uuid(), 'Telefonia',          'from-cyan-400 to-blue-600',      'cyan',    'smartphone'),
  (gen_random_uuid(), 'Saúde',              'from-rose-400 to-pink-600',      'rose',    'heart-pulse'),
  (gen_random_uuid(), 'Assinaturas',        'from-fuchsia-500 to-purple-600', 'fuchsia', 'repeat'),
  (gen_random_uuid(), 'Cartão de Crédito',  'from-emerald-400 to-teal-600',   'emerald', 'credit-card'),
  (gen_random_uuid(), 'Alimentação',        'from-lime-400 to-green-600',     'lime',    'utensils'),
  (gen_random_uuid(), 'Lazer',              'from-sky-400 to-indigo-600',     'sky',     'party-popper'),
  (gen_random_uuid(), 'Outros',             'from-slate-400 to-slate-600',    'slate',   'shapes');

-- Gastos iniciais (referenciam categorias por nome)
insert into expenses (name, amount, type, category_id, due_day, owner)
select v.name, v.amount, v.type, c.id, v.due_day, v.owner
from (values
  ('Aluguel', 2800.00, 'fixed', 'Moradia', 5, null),
  ('Condomínio', 680.00, 'fixed', 'Moradia', 10, null),
  ('Luz', null, 'variable', 'Utilidades', 20, null),
  ('Internet', null, 'fixed', 'Utilidades', 15, null),
  ('Gás', null, 'variable', 'Utilidades', null, null),
  ('Telefone Lucas', 50.00, 'fixed', 'Telefonia', 8, 'Lucas'),
  ('Telefone Vanessa', 45.00, 'fixed', 'Telefonia', 8, 'Vanessa'),
  ('Dentista Vanessa', 360.00, 'fixed', 'Saúde', 12, 'Vanessa'),
  ('Cartão de crédito Lucas', 3000.00, 'variable', 'Cartão de Crédito', 7, 'Lucas'),
  ('Youtube', 34.90, 'fixed', 'Assinaturas', 2, null),
  ('Apple Vanessa', 5.90, 'fixed', 'Assinaturas', 3, 'Vanessa'),
  ('Spotify Vanessa', 23.90, 'fixed', 'Assinaturas', 18, 'Vanessa')
) as v(name, amount, type, cat_name, due_day, owner)
join categories c on c.name = v.cat_name;
