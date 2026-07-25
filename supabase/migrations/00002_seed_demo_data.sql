-- Optional demo seed data for zcrm
-- Safe to re-run: only inserts when tables are empty

insert into zcrm.accounts (account_name, account_type, industry, phone, website, account_owner, billing_city)
select * from (values
  ('Acme Corp', 'Customer', 'Technology', '+1-555-0100', 'https://acme.example', 'Demo User', 'San Francisco'),
  ('Stark Industries', 'Prospect', 'Manufacturing', '+1-555-0101', 'https://stark.example', 'Alex Sales', 'New York'),
  ('Wayne Enterprises', 'Customer', 'Finance', '+1-555-0102', 'https://wayne.example', 'Sam Manager', 'Gotham')
) as v(account_name, account_type, industry, phone, website, account_owner, billing_city)
where not exists (select 1 from zcrm.accounts limit 1);

insert into zcrm.leads (first_name, last_name, company, email, phone, lead_source, lead_status, lead_owner, city)
select * from (values
  ('Nova', 'Soft', 'NovaSoft', 'nova@novasoft.example', '+1-555-1001', 'Web Research', 'Open', 'Demo User', 'Austin'),
  ('Jordan', 'Lee', 'GreenLeaf Co', 'jordan@greenleaf.example', '+1-555-1002', 'Trade Show', 'Contacted', 'Alex Sales', 'Seattle'),
  ('Riley', 'Chen', 'Orbit Labs', 'riley@orbit.example', '+1-555-1003', 'Cold Call', 'Qualified', 'Demo User', 'Boston')
) as v(first_name, last_name, company, email, phone, lead_source, lead_status, lead_owner, city)
where not exists (select 1 from zcrm.leads limit 1);

insert into zcrm.contacts (first_name, last_name, email, phone, title, contact_owner, account_id)
select 'Pepper', 'Potts', 'pepper@acme.example', '+1-555-2001', 'COO', 'Demo User', a.id
from zcrm.accounts a where a.account_name = 'Acme Corp'
and not exists (select 1 from zcrm.contacts limit 1);

insert into zcrm.deals (deal_name, amount, stage, probability, closing_date, deal_owner, account_id)
select 'Stark Fleet Deal', 125000, 'Negotiation/Review', 90, current_date + 14, 'Alex Sales', a.id
from zcrm.accounts a where a.account_name = 'Stark Industries'
and not exists (select 1 from zcrm.deals limit 1);

insert into zcrm.deals (deal_name, amount, stage, probability, closing_date, deal_owner, account_id)
select 'Acme Expansion', 48000, 'Proposal/Price Quote', 75, current_date + 30, 'Demo User', a.id
from zcrm.accounts a where a.account_name = 'Acme Corp'
and not exists (select 1 from zcrm.deals where deal_name = 'Acme Expansion');

insert into zcrm.tasks (subject, due_date, status, priority, owner_name)
select * from (values
  ('Update forecast numbers', current_date, 'Not Started', 'High', 'Demo User'),
  ('Send proposal to Acme', current_date + 2, 'In Progress', 'Normal', 'Demo User'),
  ('Follow up NovaSoft lead', current_date + 1, 'Not Started', 'Normal', 'Alex Sales')
) as v(subject, due_date, status, priority, owner_name)
where not exists (select 1 from zcrm.tasks limit 1);

insert into zcrm.meetings (title, location, from_datetime, to_datetime, host_name)
select * from (values
  ('Discovery Call — GreenLeaf', 'Zoom', now() + interval '1 day', now() + interval '1 day 1 hour', 'Demo User'),
  ('Quarterly Business Review', 'HQ Room A', now() + interval '3 days', now() + interval '3 days 2 hours', 'Sam Manager')
) as v(title, location, from_datetime, to_datetime, host_name)
where not exists (select 1 from zcrm.meetings limit 1);

insert into zcrm.products (product_name, product_code, product_category, unit_price, qty_in_stock, product_active)
select * from (values
  ('CRM Pro License', 'CRM-PRO', 'Software', 99.00, 500, true),
  ('Implementation Package', 'IMP-STD', 'Services', 2500.00, 50, true),
  ('Support Plus', 'SUP-PLUS', 'Support', 49.00, 999, true)
) as v(product_name, product_code, product_category, unit_price, qty_in_stock, product_active)
where not exists (select 1 from zcrm.products limit 1);

insert into zcrm.email_threads (subject, from_email, to_email, preview, folder, is_read)
select * from (values
  ('Re: Pricing for Enterprise', 'kris@king.com', 'demo@crm.local', 'Thanks for the quote, can we discuss volume discounts?', 'Inbox', false),
  ('Contract review', 'pepper@acme.example', 'demo@crm.local', 'Legal finished reviewing the MSA…', 'Inbox', false),
  ('Demo follow-up', 'sam@greenleaf.co', 'demo@crm.local', 'Great session — sending requirements…', 'Inbox', true)
) as v(subject, from_email, to_email, preview, folder, is_read)
where not exists (select 1 from zcrm.email_threads limit 1);

insert into zcrm.tags (name, color)
select * from (values
  ('Hot', '#ef4444'),
  ('Enterprise', '#2c5cc5'),
  ('Follow-up', '#f59e0b')
) as v(name, color)
where not exists (select 1 from zcrm.tags limit 1);
