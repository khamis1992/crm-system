-- ZCRM Schema: Full CRM System for Supabase
-- Apply via Supabase SQL Editor or: supabase db push
-- Also run: GRANT USAGE ON SCHEMA zcrm TO anon, authenticated, service_role;
--           GRANT ALL ON ALL TABLES IN SCHEMA zcrm TO anon, authenticated, service_role;
--           GRANT ALL ON ALL SEQUENCES IN SCHEMA zcrm TO anon, authenticated, service_role;
-- And expose schema zcrm in Dashboard → Settings → API → Exposed schemas

create schema if not exists zcrm;

-- ============================================================
-- CORE CRM TABLES (order matters for FKs)
-- ============================================================

create table if not exists zcrm.accounts (
  id uuid primary key default gen_random_uuid(),
  account_owner text,
  account_name text not null,
  account_type text,
  industry text,
  phone text,
  website text,
  annual_revenue numeric(15,2),
  employees integer,
  billing_city text,
  billing_state text,
  billing_country text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.leads (
  id uuid primary key default gen_random_uuid(),
  lead_owner text,
  company text,
  first_name text,
  last_name text,
  title text,
  email text,
  phone text,
  fax text,
  mobile text,
  website text,
  lead_source text,
  lead_status text default 'Open',
  industry text,
  no_of_employees integer,
  annual_revenue numeric(15,2),
  rating text,
  email_opt_out boolean default false,
  skype_id text,
  secondary_email text,
  twitter text,
  street text,
  city text,
  state text,
  zip_code text,
  country text,
  description text,
  converted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.contacts (
  id uuid primary key default gen_random_uuid(),
  contact_owner text,
  account_id uuid references zcrm.accounts(id) on delete set null,
  first_name text,
  last_name text,
  title text,
  email text,
  phone text,
  mobile text,
  lead_source text,
  mailing_city text,
  mailing_state text,
  mailing_country text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.deals (
  id uuid primary key default gen_random_uuid(),
  deal_owner text,
  deal_name text not null,
  account_id uuid references zcrm.accounts(id) on delete set null,
  contact_id uuid references zcrm.contacts(id) on delete set null,
  amount numeric(15,2),
  closing_date date,
  stage text default 'Qualification',
  probability integer,
  type text,
  lead_source text,
  next_step text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.tasks (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  due_date date,
  status text default 'Not Started',
  priority text default 'Normal',
  description text,
  completed boolean default false,
  owner_name text,
  related_to_type text,
  related_to_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text,
  from_datetime timestamptz,
  to_datetime timestamptz,
  description text,
  host_name text,
  related_to_type text,
  related_to_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.calls (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  call_type text default 'Outbound',
  call_purpose text,
  call_start timestamptz,
  call_duration_minutes integer,
  call_result text,
  description text,
  related_to_type text,
  related_to_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  product_code text,
  product_category text,
  unit_price numeric(15,2),
  qty_in_stock integer,
  product_active boolean default true,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.quotes (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  quote_stage text default 'Draft',
  valid_until date,
  grand_total numeric(15,2),
  account_id uuid references zcrm.accounts(id) on delete set null,
  owner_name text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.sales_orders (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  status text default 'Created',
  due_date date,
  grand_total numeric(15,2),
  owner_name text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  vendor_name text,
  status text default 'Created',
  po_date date,
  due_date date,
  grand_total numeric(15,2),
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.invoices (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  status text default 'Created',
  invoice_date date,
  due_date date,
  grand_total numeric(15,2),
  owner_name text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.price_books (
  id uuid primary key default gen_random_uuid(),
  price_book_name text not null,
  active boolean default true,
  pricing_model text default 'Flat',
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_name text not null,
  campaign_type text,
  status text default 'Planning',
  start_date date,
  end_date date,
  budgeted_cost numeric(15,2),
  expected_revenue numeric(15,2),
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.vendors (
  id uuid primary key default gen_random_uuid(),
  vendor_name text not null,
  phone text,
  email text,
  category text,
  city text,
  country text,
  website text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.cases (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  case_origin text,
  status text default 'New',
  priority text default 'Medium',
  type text,
  email text,
  description text,
  solution text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.solutions (
  id uuid primary key default gen_random_uuid(),
  solution_title text not null,
  status text default 'Draft',
  question text,
  answer text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  folder text default 'My Documents',
  file_name text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.forecasts (
  id uuid primary key default gen_random_uuid(),
  forecast_name text not null,
  period text,
  year integer,
  quarter integer,
  amount numeric(15,2),
  quota numeric(15,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.activities (
  id uuid primary key default gen_random_uuid(),
  activity_type text not null default 'note',
  subject text,
  body text,
  related_to_type text,
  related_to_id uuid,
  owner_name text,
  created_at timestamptz default now()
);

create table if not exists zcrm.notes (
  id uuid primary key default gen_random_uuid(),
  title text,
  body text,
  related_to_type text,
  related_to_id uuid,
  created_at timestamptz default now()
);

create table if not exists zcrm.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text default '#3b82f6',
  created_at timestamptz default now()
);

create table if not exists zcrm.record_tags (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid references zcrm.tags(id) on delete cascade,
  record_type text not null,
  record_id uuid not null,
  created_at timestamptz default now()
);

create table if not exists zcrm.approvals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  module text not null,
  record_id uuid,
  requested_by text,
  assigned_to text,
  status text default 'Pending',
  comments text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.pipelines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  module text not null default 'deals',
  is_default boolean default false,
  stages jsonb default '[]'::jsonb,
  description text,
  created_at timestamptz default now()
);

create table if not exists zcrm.workflow_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  module text not null,
  description text,
  trigger_type text not null default 'on_create',
  conditions jsonb default '[]'::jsonb,
  actions jsonb default '[]'::jsonb,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.reports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  folder text default 'Created By Me',
  module text not null,
  columns jsonb default '[]'::jsonb,
  filters jsonb default '[]'::jsonb,
  chart_type text default 'Table',
  x_axis text,
  y_axis text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.projects (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  status text default 'Planning',
  owner_name text,
  start_date date,
  end_date date,
  budget numeric(15,2),
  description text,
  deal_id uuid references zcrm.deals(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.visits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text,
  check_in timestamptz,
  check_out timestamptz,
  status text default 'Scheduled',
  owner_name text,
  related_to_type text,
  related_to_id uuid,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.social_brands (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  platform text not null,
  handle text,
  status text default 'Connected',
  created_at timestamptz default now()
);

create table if not exists zcrm.email_threads (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  from_email text,
  to_email text,
  preview text,
  folder text default 'Inbox',
  is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists zcrm.marketplace_apps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  installed boolean default false,
  created_at timestamptz default now()
);

create table if not exists zcrm.sheets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  module text not null,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists zcrm.org_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_leads_status on zcrm.leads(lead_status);
create index if not exists idx_leads_owner on zcrm.leads(lead_owner);
create index if not exists idx_leads_created on zcrm.leads(created_at desc);
create index if not exists idx_contacts_account on zcrm.contacts(account_id);
create index if not exists idx_deals_stage on zcrm.deals(stage);
create index if not exists idx_deals_account on zcrm.deals(account_id);
create index if not exists idx_tasks_status on zcrm.tasks(status);
create index if not exists idx_activities_related on zcrm.activities(related_to_type, related_to_id);
create index if not exists idx_notes_related on zcrm.notes(related_to_type, related_to_id);
create index if not exists idx_record_tags on zcrm.record_tags(record_type, record_id);
create index if not exists idx_approvals_status on zcrm.approvals(status);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function zcrm.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'accounts','leads','contacts','deals','tasks','meetings','calls',
      'products','quotes','sales_orders','purchase_orders','invoices','price_books',
      'campaigns','vendors','cases','solutions','documents','forecasts',
      'approvals','workflow_rules','reports','projects','visits','sheets','org_settings'
    ])
  loop
    execute format('drop trigger if exists trg_updated_at on zcrm.%I', t);
    execute format('create trigger trg_updated_at before update on zcrm.%I for each row execute function zcrm.update_updated_at()', t);
  end loop;
end;
$$;

-- ============================================================
-- RLS + open policies (tighten later with real multi-tenant rules)
-- ============================================================

do $$
declare
  t text;
begin
  for t in
    select table_name from information_schema.tables where table_schema = 'zcrm'
  loop
    execute format('alter table zcrm.%I enable row level security', t);
    execute format('drop policy if exists "zcrm_all_access" on zcrm.%I', t);
    execute format('create policy "zcrm_all_access" on zcrm.%I for all using (true) with check (true)', t);
  end loop;
end;
$$;

grant usage on schema zcrm to anon, authenticated, service_role;
grant all on all tables in schema zcrm to anon, authenticated, service_role;
grant all on all sequences in schema zcrm to anon, authenticated, service_role;
alter default privileges in schema zcrm grant all on tables to anon, authenticated, service_role;

-- ============================================================
-- SEED DATA
-- ============================================================

insert into zcrm.pipelines (name, module, is_default, stages, description)
select 'Standard', 'deals', true, '[
  {"name":"Qualification","prob":10},
  {"name":"Needs Analysis","prob":20},
  {"name":"Value Proposition","prob":40},
  {"name":"Identify Decision Makers","prob":60},
  {"name":"Proposal/Price Quote","prob":75},
  {"name":"Negotiation/Review","prob":90},
  {"name":"Closed Won","prob":100},
  {"name":"Closed Lost","prob":0}
]'::jsonb, 'Default deal pipeline'
where not exists (select 1 from zcrm.pipelines where name = 'Standard');

insert into zcrm.reports (name, folder, module, columns, chart_type, x_axis, y_axis)
select * from (values
  ('Leads by Status', 'Public Reports', 'leads', '["first_name","last_name","email","lead_status","lead_owner"]'::jsonb, 'Bar', 'lead_status', 'Record Count'),
  ('Leads by Source', 'Public Reports', 'leads', '["first_name","last_name","email","lead_source","lead_owner"]'::jsonb, 'Pie', 'lead_source', 'Record Count'),
  ('Pipeline by Stage', 'Public Reports', 'deals', '["deal_name","amount","stage","closing_date","deal_owner"]'::jsonb, 'Bar', 'stage', 'Amount'),
  ('Closed Deals this Month', 'Created By Me', 'deals', '["deal_name","amount","stage","closing_date"]'::jsonb, 'Table', null, null),
  ('Open Tasks by Priority', 'Created By Me', 'tasks', '["subject","due_date","priority","status","owner_name"]'::jsonb, 'Table', null, null),
  ('Cases by Status', 'Shared with Me', 'cases', '["subject","status","priority","case_origin"]'::jsonb, 'Pie', 'status', 'Record Count')
) as v(name, folder, module, columns, chart_type, x_axis, y_axis)
where not exists (select 1 from zcrm.reports limit 1);

insert into zcrm.marketplace_apps (name, category, description, installed)
select * from (values
  ('Gmail Integration', 'Email', 'Sync Gmail threads into SalesInbox', false),
  ('Slack Notifications', 'Collaboration', 'Push CRM events to Slack channels', false),
  ('DocuSign', 'Documents', 'Send quotes for e-signature', false),
  ('Twilio SMS', 'Phone', 'Log SMS conversations as activities', false),
  ('Google Calendar', 'Calendar', 'Two-way meeting sync', true)
) as v(name, category, description, installed)
where not exists (select 1 from zcrm.marketplace_apps limit 1);

insert into zcrm.workflow_rules (name, module, description, trigger_type, conditions, actions, active)
select * from (values
  ('Notify owner on deal stage', 'deals', 'Email when deal is Closed Won', 'on_edit', '[{"field":"stage","op":"is","value":"Closed Won"}]'::jsonb, '["Email Notification"]'::jsonb, true),
  ('Assign lead round-robin', 'leads', 'Assign new web leads', 'on_create', '[{"field":"lead_source","op":"is","value":"Web Download"}]'::jsonb, '["Assign Owner"]'::jsonb, true)
) as v(name, module, description, trigger_type, conditions, actions, active)
where not exists (select 1 from zcrm.workflow_rules limit 1);
