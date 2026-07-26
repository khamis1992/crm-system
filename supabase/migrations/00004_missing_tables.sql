-- Ensure tables that some pages need (safe if already exist)

create schema if not exists zcrm;

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

create table if not exists zcrm.org_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
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

create table if not exists zcrm.projects (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  status text default 'Planning',
  owner_name text,
  start_date date,
  end_date date,
  budget numeric(15,2),
  description text,
  deal_id uuid,
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

-- Quote line totals
alter table zcrm.quotes add column if not exists sub_total numeric(15,2);
alter table zcrm.quotes add column if not exists discount numeric(15,2);
alter table zcrm.quotes add column if not exists tax numeric(15,2);
alter table zcrm.quotes add column if not exists owner_name text;
alter table zcrm.sales_orders add column if not exists sub_total numeric(15,2);
alter table zcrm.sales_orders add column if not exists discount numeric(15,2);
alter table zcrm.sales_orders add column if not exists tax numeric(15,2);
alter table zcrm.invoices add column if not exists sub_total numeric(15,2);
alter table zcrm.invoices add column if not exists discount numeric(15,2);
alter table zcrm.invoices add column if not exists tax numeric(15,2);

-- RLS open policies
do $$
declare t text;
begin
  for t in
    select unnest(array[
      'reports','org_settings','approvals','pipelines','workflow_rules','projects',
      'visits','social_brands','email_threads','marketplace_apps','sheets','notes',
      'tags','record_tags','activities'
    ])
  loop
    begin
      execute format('alter table zcrm.%I enable row level security', t);
      execute format('drop policy if exists "zcrm_all_access" on zcrm.%I', t);
      execute format('create policy "zcrm_all_access" on zcrm.%I for all using (true) with check (true)', t);
    exception when undefined_table then
      null;
    end;
  end loop;
end $$;

grant usage on schema zcrm to anon, authenticated, service_role;
grant all on all tables in schema zcrm to anon, authenticated, service_role;
grant all on all sequences in schema zcrm to anon, authenticated, service_role;

-- seed reports if empty
insert into zcrm.reports (name, folder, module, columns, chart_type, x_axis, y_axis)
select * from (values
  ('Leads by Status', 'Public Reports', 'leads', '["first_name","last_name","email","lead_status"]'::jsonb, 'Bar', 'lead_status', 'Record Count'),
  ('Pipeline by Stage', 'Public Reports', 'deals', '["deal_name","amount","stage"]'::jsonb, 'Bar', 'stage', 'Amount'),
  ('Open Tasks by Priority', 'Created By Me', 'tasks', '["subject","priority","status"]'::jsonb, 'Table', null, null)
) as v(name, folder, module, columns, chart_type, x_axis, y_axis)
where not exists (select 1 from zcrm.reports limit 1);

insert into zcrm.marketplace_apps (name, category, description, installed)
select * from (values
  ('Gmail Integration', 'Email', 'Sync Gmail threads', false),
  ('Slack Notifications', 'Collaboration', 'Push CRM events to Slack', false),
  ('Google Calendar', 'Calendar', 'Two-way meeting sync', true)
) as v(name, category, description, installed)
where not exists (select 1 from zcrm.marketplace_apps limit 1);
