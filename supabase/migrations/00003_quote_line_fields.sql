-- Extra quote totals used by line-items form
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

alter table zcrm.activities add column if not exists owner_name text;
