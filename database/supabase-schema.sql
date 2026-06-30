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

create table if not exists public.ourcfo_state_meta (
  state_key text primary key default 'default',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ourcfo_assets enable row level security;
alter table public.ourcfo_stock_holdings enable row level security;
alter table public.ourcfo_ledger_entries enable row level security;
alter table public.ourcfo_variable_budgets enable row level security;
alter table public.ourcfo_stock_transactions enable row level security;
alter table public.ourcfo_monthly_closings enable row level security;
alter table public.ourcfo_state_meta enable row level security;

create table if not exists public.market_daily (
  report_date date not null,
  symbol text not null,
  source_symbol text not null default '',
  label text not null default '',
  price numeric,
  previous_close numeric,
  change_pct numeric,
  year_high numeric,
  year_low numeric,
  drawdown_pct numeric,
  currency text not null default '',
  source text not null default '',
  as_of timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (report_date, symbol)
);

create table if not exists public.macro_daily (
  report_date date not null,
  indicator_key text not null,
  series_id text not null default '',
  label text not null default '',
  value numeric,
  previous_value numeric,
  change numeric,
  yoy_pct numeric,
  unit text not null default '',
  indicator_date date,
  source text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (report_date, indicator_key)
);

create table if not exists public.news_daily (
  report_date date not null,
  rank integer not null,
  title text not null default '',
  source text not null default '',
  url text not null default '',
  published_at timestamptz,
  summary_ko text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (report_date, rank)
);

create table if not exists public.cio_reports (
  report_date date primary key,
  title text not null default 'OurCFO CIO Report',
  message text not null default '',
  qqq_drawdown_pct numeric,
  qqq_zone text not null default '',
  action_card text not null default '',
  asset_snapshot jsonb not null default '{}'::jsonb,
  market_snapshot jsonb not null default '{}'::jsonb,
  macro_snapshot jsonb not null default '{}'::jsonb,
  news_snapshot jsonb not null default '[]'::jsonb,
  cio_opinion jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  alert_key text primary key,
  report_date date not null,
  type text not null default 'condition',
  severity text not null default 'info',
  title text not null default '',
  message text not null default '',
  payload jsonb not null default '{}'::jsonb,
  triggered_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists public.economy_lessons (
  lesson_date date primary key,
  terms jsonb not null default '[]'::jsonb,
  difficulty text not null default '초급',
  summary jsonb not null default '{}'::jsonb,
  quiz jsonb not null default '{}'::jsonb,
  message text not null default '',
  news_snapshot jsonb not null default '[]'::jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.market_daily enable row level security;
alter table public.macro_daily enable row level security;
alter table public.news_daily enable row level security;
alter table public.cio_reports enable row level security;
alter table public.alerts enable row level security;
alter table public.economy_lessons enable row level security;
