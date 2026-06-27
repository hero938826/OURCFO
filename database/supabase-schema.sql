create table if not exists public.ourcfo_assets (
  id text primary key,
  month text not null,
  category text not null,
  name text not null,
  amount numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ourcfo_stock_holdings (
  id text primary key,
  ticker text not null,
  country text not null default 'US',
  quantity numeric not null default 0,
  purchase_price numeric not null default 0,
  account text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.ourcfo_ledger_entries (
  id text primary key,
  date text not null,
  type text not null,
  category text not null default '',
  amount numeric not null default 0,
  payment text not null default '-',
  memo text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.ourcfo_variable_budgets (
  month text primary key,
  amount numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.ourcfo_stock_transactions (
  id text primary key,
  date text not null,
  type text not null,
  ticker text not null,
  country text not null default 'US',
  account text not null default '',
  quantity numeric not null default 0,
  price numeric not null default 0,
  fx_rate numeric not null default 1,
  amount_krw numeric not null default 0,
  cost_basis_krw numeric not null default 0,
  realized_profit_krw numeric not null default 0,
  memo text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.ourcfo_monthly_closings (
  month text primary key,
  net_worth numeric not null default 0,
  saving_rate numeric not null default 0,
  budget_burn_rate numeric not null default 0,
  investment_principal_krw numeric not null default 0,
  investment_value_krw numeric not null default 0,
  investment_profit_krw numeric not null default 0,
  investment_return_rate numeric not null default 0,
  closed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.ourcfo_assets enable row level security;
alter table public.ourcfo_stock_holdings enable row level security;
alter table public.ourcfo_ledger_entries enable row level security;
alter table public.ourcfo_variable_budgets enable row level security;
alter table public.ourcfo_stock_transactions enable row level security;
alter table public.ourcfo_monthly_closings enable row level security;
