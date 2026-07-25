import type { FieldDef, ModuleConfig } from "@/components/GenericModule";
import { DEAL_STAGES, LEAD_SOURCES, INDUSTRIES, LEAD_STATUSES } from "@/lib/supabase";

export type { ModuleConfig };

export const leadsConfig: ModuleConfig = {
  table: "leads",
  title: "Leads",
  href: "/leads",
  createLabel: "Create Lead",
  ownerField: "lead_owner",
  supportsConvert: true,
  kanbanField: "lead_status",
  kanbanStatuses: [...LEAD_STATUSES],
  fields: [
    { key: "lead_owner", label: "Lead Owner", section: "Lead Information", list: true },
    { key: "company", label: "Company", section: "Lead Information", list: true },
    { key: "first_name", label: "First Name", section: "Lead Information", list: true },
    { key: "last_name", label: "Last Name", required: true, section: "Lead Information", list: true, link: true },
    { key: "title", label: "Title", section: "Lead Information" },
    { key: "email", label: "Email", type: "email", section: "Lead Information", list: true },
    { key: "phone", label: "Phone", section: "Lead Information", list: true },
    { key: "mobile", label: "Mobile", section: "Lead Information" },
    { key: "website", label: "Website", section: "Lead Information" },
    { key: "lead_source", label: "Lead Source", type: "select", options: [...LEAD_SOURCES], section: "Lead Information", list: true },
    { key: "lead_status", label: "Lead Status", type: "select", options: [...LEAD_STATUSES], section: "Lead Information", list: true },
    { key: "industry", label: "Industry", type: "select", options: [...INDUSTRIES], section: "Lead Information" },
    { key: "annual_revenue", label: "Annual Revenue", type: "money", section: "Lead Information", list: true },
    { key: "rating", label: "Rating", type: "select", options: ["Acquired", "Active", "Market Failed", "Project Cancelled", "Shut Down"], section: "Lead Information" },
    { key: "city", label: "City", section: "Address Information" },
    { key: "state", label: "State", section: "Address Information" },
    { key: "country", label: "Country", section: "Address Information" },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const contactsConfig: ModuleConfig = {
  table: "contacts",
  title: "Contacts",
  href: "/contacts",
  createLabel: "Create Contact",
  ownerField: "contact_owner",
  fields: [
    { key: "contact_owner", label: "Contact Owner", section: "Contact Information", list: true },
    { key: "first_name", label: "First Name", section: "Contact Information", list: true },
    { key: "last_name", label: "Last Name", required: true, section: "Contact Information", list: true, link: true },
    { key: "account_id", label: "Account Name", section: "Contact Information", list: false },
    { key: "title", label: "Title", section: "Contact Information", list: true },
    { key: "email", label: "Email", type: "email", section: "Contact Information", list: true },
    { key: "phone", label: "Phone", section: "Contact Information", list: true },
    { key: "mobile", label: "Mobile", section: "Contact Information" },
    { key: "lead_source", label: "Lead Source", type: "select", options: [...LEAD_SOURCES], section: "Contact Information" },
    { key: "mailing_city", label: "Mailing City", section: "Address Information", list: true },
    { key: "mailing_state", label: "Mailing State", section: "Address Information" },
    { key: "mailing_country", label: "Mailing Country", section: "Address Information" },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const accountsConfig: ModuleConfig = {
  table: "accounts",
  title: "Accounts",
  href: "/accounts",
  createLabel: "Create Account",
  ownerField: "account_owner",
  fields: [
    { key: "account_owner", label: "Account Owner", section: "Account Information", list: true },
    { key: "account_name", label: "Account Name", required: true, section: "Account Information", list: true, link: true },
    { key: "account_type", label: "Account Type", type: "select", options: ["Analyst", "Competitor", "Customer", "Distributor", "Integrator", "Investor", "Other", "Partner", "Press", "Prospect", "Reseller", "Supplier", "Vendor"], section: "Account Information", list: true },
    { key: "industry", label: "Industry", type: "select", options: [...INDUSTRIES], section: "Account Information", list: true },
    { key: "phone", label: "Phone", section: "Account Information", list: true },
    { key: "website", label: "Website", section: "Account Information", list: true },
    { key: "annual_revenue", label: "Annual Revenue", type: "money", section: "Account Information", list: true },
    { key: "employees", label: "Employees", type: "number", section: "Account Information" },
    { key: "billing_city", label: "Billing City", section: "Address Information", list: true },
    { key: "billing_state", label: "Billing State", section: "Address Information" },
    { key: "billing_country", label: "Billing Country", section: "Address Information" },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const dealsConfig: ModuleConfig = {
  table: "deals",
  title: "Deals",
  href: "/deals",
  createLabel: "Create Deal",
  ownerField: "deal_owner",
  kanbanField: "stage",
  kanbanStatuses: [...DEAL_STAGES],
  fields: [
    { key: "deal_owner", label: "Deal Owner", section: "Deal Information", list: true },
    { key: "deal_name", label: "Deal Name", required: true, section: "Deal Information", list: true, link: true },
    { key: "amount", label: "Amount", type: "money", section: "Deal Information", list: true },
    { key: "closing_date", label: "Closing Date", type: "date", section: "Deal Information", list: true },
    { key: "stage", label: "Stage", type: "select", options: [...DEAL_STAGES], section: "Deal Information", list: true },
    { key: "probability", label: "Probability (%)", type: "number", section: "Deal Information", list: true },
    { key: "type", label: "Type", type: "select", options: ["Existing Business", "New Business"], section: "Deal Information" },
    { key: "lead_source", label: "Lead Source", type: "select", options: [...LEAD_SOURCES], section: "Deal Information" },
    { key: "next_step", label: "Next Step", section: "Deal Information" },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const tasksConfig: ModuleConfig = {
  table: "tasks",
  title: "Tasks",
  href: "/tasks",
  createLabel: "Create Task",
  fields: [
    { key: "subject", label: "Subject", required: true, section: "Task Information", list: true, link: true },
    { key: "due_date", label: "Due Date", type: "date", section: "Task Information", list: true },
    { key: "status", label: "Status", type: "select", options: ["Not Started", "Deferred", "In Progress", "Completed", "Waiting for input"], section: "Task Information", list: true },
    { key: "priority", label: "Priority", type: "select", options: ["Highest", "High", "Normal", "Low", "Lowest"], section: "Task Information", list: true },
    { key: "owner_name", label: "Task Owner", section: "Task Information", list: true },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const meetingsConfig: ModuleConfig = {
  table: "meetings",
  title: "Meetings",
  href: "/meetings",
  createLabel: "Create Meeting",
  fields: [
    { key: "title", label: "Title", required: true, section: "Meeting Information", list: true, link: true },
    { key: "location", label: "Location", section: "Meeting Information", list: true },
    { key: "from_datetime", label: "From", type: "datetime-local", section: "Meeting Information", list: true },
    { key: "to_datetime", label: "To", type: "datetime-local", section: "Meeting Information", list: true },
    { key: "host_name", label: "Host", section: "Meeting Information", list: true },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const callsConfig: ModuleConfig = {
  table: "calls",
  title: "Calls",
  href: "/calls",
  createLabel: "Log a Call",
  fields: [
    { key: "subject", label: "Subject", required: true, section: "Call Information", list: true, link: true },
    { key: "call_type", label: "Call Type", type: "select", options: ["Outbound", "Inbound", "Missed"], section: "Call Information", list: true },
    { key: "call_purpose", label: "Call Purpose", type: "select", options: ["Prospecting", "Administrative", "Negotiation", "Demo", "Project", "Support"], section: "Call Information", list: true },
    { key: "call_start", label: "Call Start Time", type: "datetime-local", section: "Call Information", list: true },
    { key: "call_duration_minutes", label: "Duration (min)", type: "number", section: "Call Information", list: true },
    { key: "call_result", label: "Call Result", section: "Call Information", list: true },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const productsConfig: ModuleConfig = {
  table: "products",
  title: "Products",
  href: "/products",
  createLabel: "Create Product",
  fields: [
    { key: "product_name", label: "Product Name", required: true, section: "Product Information", list: true, link: true },
    { key: "product_code", label: "Product Code", section: "Product Information", list: true },
    { key: "product_category", label: "Category", section: "Product Information", list: true },
    { key: "unit_price", label: "Unit Price", type: "money", section: "Product Information", list: true },
    { key: "qty_in_stock", label: "Qty in Stock", type: "number", section: "Product Information", list: true },
    { key: "product_active", label: "Product Active", type: "checkbox", section: "Product Information", list: true },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const quotesConfig: ModuleConfig = {
  table: "quotes",
  title: "Quotes",
  href: "/quotes",
  createLabel: "Create Quote",
  fields: [
    { key: "subject", label: "Subject", required: true, section: "Quote Information", list: true, link: true },
    { key: "quote_stage", label: "Quote Stage", type: "select", options: ["Draft", "Negotiation", "Delivered", "On Hold", "Confirmed", "Closed Won", "Closed Lost"], section: "Quote Information", list: true },
    { key: "valid_until", label: "Valid Until", type: "date", section: "Quote Information", list: true },
    { key: "grand_total", label: "Grand Total", type: "money", section: "Quote Information", list: true },
    { key: "owner_name", label: "Quote Owner", section: "Quote Information", list: true },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const salesOrdersConfig: ModuleConfig = {
  table: "sales_orders",
  title: "Sales Orders",
  href: "/sales-orders",
  createLabel: "Create Sales Order",
  fields: [
    { key: "subject", label: "Subject", required: true, section: "Sales Order Information", list: true, link: true },
    { key: "status", label: "Status", type: "select", options: ["Created", "Approved", "Delivered", "Cancelled"], section: "Sales Order Information", list: true },
    { key: "due_date", label: "Due Date", type: "date", section: "Sales Order Information", list: true },
    { key: "grand_total", label: "Grand Total", type: "money", section: "Sales Order Information", list: true },
    { key: "owner_name", label: "Owner", section: "Sales Order Information", list: true },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const purchaseOrdersConfig: ModuleConfig = {
  table: "purchase_orders",
  title: "Purchase Orders",
  href: "/purchase-orders",
  createLabel: "Create Purchase Order",
  fields: [
    { key: "subject", label: "Subject", required: true, section: "Purchase Order Information", list: true, link: true },
    { key: "vendor_name", label: "Vendor Name", section: "Purchase Order Information", list: true },
    { key: "status", label: "Status", type: "select", options: ["Created", "Approved", "Delivered", "Cancelled"], section: "Purchase Order Information", list: true },
    { key: "po_date", label: "PO Date", type: "date", section: "Purchase Order Information", list: true },
    { key: "due_date", label: "Due Date", type: "date", section: "Purchase Order Information", list: true },
    { key: "grand_total", label: "Grand Total", type: "money", section: "Purchase Order Information", list: true },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const invoicesConfig: ModuleConfig = {
  table: "invoices",
  title: "Invoices",
  href: "/invoices",
  createLabel: "Create Invoice",
  fields: [
    { key: "subject", label: "Subject", required: true, section: "Invoice Information", list: true, link: true },
    { key: "status", label: "Status", type: "select", options: ["Created", "Approved", "Delivered", "Paid", "Cancelled"], section: "Invoice Information", list: true },
    { key: "invoice_date", label: "Invoice Date", type: "date", section: "Invoice Information", list: true },
    { key: "due_date", label: "Due Date", type: "date", section: "Invoice Information", list: true },
    { key: "grand_total", label: "Grand Total", type: "money", section: "Invoice Information", list: true },
    { key: "owner_name", label: "Owner", section: "Invoice Information", list: true },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const campaignsConfig: ModuleConfig = {
  table: "campaigns",
  title: "Campaigns",
  href: "/campaigns",
  createLabel: "Create Campaign",
  fields: [
    { key: "campaign_name", label: "Campaign Name", required: true, section: "Campaign Information", list: true, link: true },
    { key: "campaign_type", label: "Type", type: "select", options: ["Conference", "Webinar", "Trade Show", "Public Relations", "Partners", "Referral Program", "Advertisement", "Banner Ads", "Direct Mail", "Email", "Telemarketing", "Others"], section: "Campaign Information", list: true },
    { key: "status", label: "Status", type: "select", options: ["Planning", "Active", "Inactive", "Complete", "Cancelled"], section: "Campaign Information", list: true },
    { key: "start_date", label: "Start Date", type: "date", section: "Campaign Information", list: true },
    { key: "end_date", label: "End Date", type: "date", section: "Campaign Information", list: true },
    { key: "budgeted_cost", label: "Budgeted Cost", type: "money", section: "Campaign Information", list: true },
    { key: "expected_revenue", label: "Expected Revenue", type: "money", section: "Campaign Information" },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const vendorsConfig: ModuleConfig = {
  table: "vendors",
  title: "Vendors",
  href: "/vendors",
  createLabel: "Create Vendor",
  fields: [
    { key: "vendor_name", label: "Vendor Name", required: true, section: "Vendor Information", list: true, link: true },
    { key: "phone", label: "Phone", section: "Vendor Information", list: true },
    { key: "email", label: "Email", type: "email", section: "Vendor Information", list: true },
    { key: "category", label: "Category", section: "Vendor Information", list: true },
    { key: "city", label: "City", section: "Address Information", list: true },
    { key: "country", label: "Country", section: "Address Information" },
    { key: "website", label: "Website", section: "Vendor Information" },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};

export const casesConfig: ModuleConfig = {
  table: "cases",
  title: "Cases",
  href: "/cases",
  createLabel: "Create Case",
  fields: [
    { key: "subject", label: "Subject", required: true, section: "Case Information", list: true, link: true },
    { key: "case_origin", label: "Case Origin", type: "select", options: ["Email", "Phone", "Web", "Twitter", "Facebook"], section: "Case Information", list: true },
    { key: "status", label: "Status", type: "select", options: ["New", "Escalated", "On Hold", "Closed"], section: "Case Information", list: true },
    { key: "priority", label: "Priority", type: "select", options: ["Highest", "High", "Medium", "Low", "Lowest"], section: "Case Information", list: true },
    { key: "type", label: "Type", type: "select", options: ["Problem", "Feature Request", "Question"], section: "Case Information", list: true },
    { key: "email", label: "Email", type: "email", section: "Case Information", list: true },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
    { key: "solution", label: "Solution", type: "textarea", section: "Solution Information", list: false },
  ],
};

export const solutionsConfig: ModuleConfig = {
  table: "solutions",
  title: "Solutions",
  href: "/solutions",
  createLabel: "Create Solution",
  fields: [
    { key: "solution_title", label: "Solution Title", required: true, section: "Solution Information", list: true, link: true },
    { key: "status", label: "Status", type: "select", options: ["Draft", "Reviewed", "Published", "Obsolete"], section: "Solution Information", list: true },
    { key: "question", label: "Question", type: "textarea", section: "Solution Information", list: true },
    { key: "answer", label: "Answer", type: "textarea", section: "Solution Information", list: false },
  ],
};

export const documentsConfig: ModuleConfig = {
  table: "documents",
  title: "Documents",
  href: "/documents",
  createLabel: "Create Document",
  supportsUpload: true,
  fields: [
    { key: "title", label: "Title", required: true, section: "Document Information", list: true, link: true },
    { key: "folder", label: "Folder", section: "Document Information", list: true },
    { key: "file_name", label: "File Name", section: "Document Information", list: true },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: true },
  ],
};

export const forecastsConfig: ModuleConfig = {
  table: "forecasts",
  title: "Forecasts",
  href: "/forecasts",
  createLabel: "Create Forecast",
  fields: [
    { key: "forecast_name", label: "Forecast Name", required: true, section: "Forecast Information", list: true, link: true },
    { key: "period", label: "Period", type: "select", options: ["Monthly", "Quarterly", "Yearly"], section: "Forecast Information", list: true },
    { key: "year", label: "Year", type: "number", section: "Forecast Information", list: true },
    { key: "quarter", label: "Quarter", type: "number", section: "Forecast Information", list: true },
    { key: "amount", label: "Amount", type: "money", section: "Forecast Information", list: true },
    { key: "quota", label: "Quota", type: "money", section: "Forecast Information", list: true },
  ],
};

export const priceBooksConfig: ModuleConfig = {
  table: "price_books",
  title: "Price Books",
  href: "/price-books",
  createLabel: "Create Price Book",
  fields: [
    { key: "price_book_name", label: "Price Book Name", required: true, section: "Price Book Information", list: true, link: true },
    { key: "active", label: "Active", type: "checkbox", section: "Price Book Information", list: true },
    { key: "pricing_model", label: "Pricing Model", type: "select", options: ["Flat", "Differential"], section: "Price Book Information", list: true },
    { key: "description", label: "Description", type: "textarea", section: "Description Information", list: false },
  ],
};
