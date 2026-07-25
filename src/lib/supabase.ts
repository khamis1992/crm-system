import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const clientOptions = {
  db: { schema: "zcrm" as const },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
};

export const supabase = createClient(url || "https://placeholder.supabase.co", key || "placeholder", clientOptions);
export const supabaseAuth = supabase;

export type Lead = {
  id: string;
  lead_owner: string | null;
  company: string | null;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  fax: string | null;
  mobile: string | null;
  website: string | null;
  lead_source: string | null;
  lead_status: string | null;
  industry: string | null;
  no_of_employees: number | null;
  annual_revenue: number | null;
  rating: string | null;
  email_opt_out: boolean | null;
  skype_id: string | null;
  secondary_email: string | null;
  twitter: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  description: string | null;
  converted: boolean | null;
  created_at: string;
  updated_at: string;
};

export type Account = {
  id: string;
  account_owner: string | null;
  account_name: string;
  account_type: string | null;
  industry: string | null;
  phone: string | null;
  website: string | null;
  annual_revenue: number | null;
  employees: number | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_country: string | null;
  description: string | null;
  created_at: string;
};

export type Contact = {
  id: string;
  contact_owner: string | null;
  account_id: string | null;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  lead_source: string | null;
  mailing_city: string | null;
  mailing_state: string | null;
  description: string | null;
  created_at: string;
  accounts?: { account_name: string } | null;
};

export type Deal = {
  id: string;
  deal_owner: string | null;
  deal_name: string;
  account_id: string | null;
  amount: number | null;
  closing_date: string | null;
  stage: string | null;
  probability: number | null;
  type: string | null;
  lead_source: string | null;
  description: string | null;
  created_at: string;
  accounts?: { account_name: string } | null;
};

export type CrmTask = {
  id: string;
  subject: string;
  due_date: string | null;
  status: string | null;
  priority: string | null;
  description: string | null;
  completed: boolean | null;
  owner_name: string | null;
  created_at: string;
};

export type Meeting = {
  id: string;
  title: string;
  location: string | null;
  from_datetime: string | null;
  to_datetime: string | null;
  description: string | null;
  host_name: string | null;
  created_at: string;
};

export type Call = {
  id: string;
  subject: string;
  call_type: string | null;
  call_purpose: string | null;
  call_start: string | null;
  call_duration_minutes: number | null;
  call_result: string | null;
  description: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  product_name: string;
  product_code: string | null;
  product_category: string | null;
  unit_price: number | null;
  qty_in_stock: number | null;
  product_active: boolean | null;
  description: string | null;
  created_at: string;
};

export type Quote = {
  id: string;
  subject: string;
  quote_stage: string | null;
  valid_until: string | null;
  grand_total: number | null;
  account_id: string | null;
  created_at: string;
};

export type SalesOrder = {
  id: string;
  subject: string;
  status: string | null;
  due_date: string | null;
  grand_total: number | null;
  created_at: string;
};

export type PurchaseOrder = {
  id: string;
  subject: string;
  vendor_name: string | null;
  status: string | null;
  due_date: string | null;
  grand_total: number | null;
  created_at: string;
};

export type Invoice = {
  id: string;
  subject: string;
  status: string | null;
  invoice_date: string | null;
  due_date: string | null;
  grand_total: number | null;
  created_at: string;
};

export type Campaign = {
  id: string;
  campaign_name: string;
  campaign_type: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  budgeted_cost: number | null;
  expected_revenue: number | null;
  created_at: string;
};

export type Vendor = {
  id: string;
  vendor_name: string;
  phone: string | null;
  email: string | null;
  category: string | null;
  city: string | null;
  created_at: string;
};

export type Case = {
  id: string;
  subject: string;
  case_origin: string | null;
  status: string | null;
  priority: string | null;
  type: string | null;
  email: string | null;
  description: string | null;
  created_at: string;
};

export type Solution = {
  id: string;
  solution_title: string;
  status: string | null;
  question: string | null;
  answer: string | null;
  created_at: string;
};

export type Document = {
  id: string;
  title: string;
  folder: string | null;
  file_name: string | null;
  description: string | null;
  created_at: string;
};

export type Forecast = {
  id: string;
  forecast_name: string;
  period: string | null;
  year: number | null;
  quarter: number | null;
  amount: number | null;
  quota: number | null;
  created_at: string;
};

export type PriceBook = {
  id: string;
  price_book_name: string;
  active: boolean | null;
  pricing_model: string | null;
  created_at: string;
};

export type Activity = {
  id: string;
  activity_type: string;
  subject: string | null;
  body: string | null;
  created_at: string;
};

export const LEAD_STATUSES = [
  "Open",
  "Contacted",
  "Attempted to Contact",
  "Not Contacted",
  "Qualified",
  "Pre-Qualified",
  "Junk Lead",
  "Lost Lead",
] as const;

export const DEAL_STAGES = [
  "Qualification",
  "Needs Analysis",
  "Value Proposition",
  "Identify Decision Makers",
  "Proposal/Price Quote",
  "Negotiation/Review",
  "Closed Won",
  "Closed Lost",
] as const;

export const LEAD_SOURCES = [
  "Advertisement",
  "Cold Call",
  "Employee Referral",
  "External Referral",
  "Online Store",
  "Partner",
  "Public Relations",
  "Sales Email Alias",
  "Seminar Partner",
  "Internal Seminar",
  "Trade Show",
  "Web Download",
  "Web Research",
  "Chat",
  "Twitter",
  "Facebook",
  "Google+",
] as const;

export const INDUSTRIES = [
  "ASP (Application Service Provider)",
  "Data/Telecom OEM",
  "ERP (Enterprise Resource Planning)",
  "Government/Military",
  "Large Enterprise",
  "ManagementISV",
  "MSP (Management Service Provider)",
  "Network Equipment (Enterprise)",
  "Non-management ISV",
  "Optical Networking",
  "Service Provider",
  "Small/Medium Enterprise",
  "Storage Equipment",
  "Storage Service Provider",
  "Systems Integrator",
  "Wireless Industry",
  "Technology",
  "Finance",
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Software",
  "Logistics",
  "Media",
  "Services",
  "Agriculture",
  "Engineering",
  "Commercial",
] as const;
