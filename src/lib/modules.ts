import {
  Home,
  UserPlus,
  Users,
  Building2,
  Handshake,
  CheckSquare,
  Calendar,
  Phone,
  BarChart3,
  PieChart,
  Package,
  FileText,
  ShoppingCart,
  ClipboardList,
  Receipt,
  Megaphone,
  Truck,
  BookOpen,
  LifeBuoy,
  Lightbulb,
  FolderOpen,
  TrendingUp,
  Rss,
  FolderKanban,
  Mail,
  Settings,
  MapPin,
  Share2,
  Table2,
  Briefcase,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

export type ModuleDef = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  table?: string;
  titleField?: string;
  createLabel?: string;
  group: "main" | "inventory" | "support" | "other";
};

export const MODULES: ModuleDef[] = [
  { key: "home", label: "Home", href: "/", icon: Home, group: "main" },
  { key: "leads", label: "Leads", href: "/leads", icon: UserPlus, table: "leads", titleField: "last_name", createLabel: "Create Lead", group: "main" },
  { key: "contacts", label: "Contacts", href: "/contacts", icon: Users, table: "contacts", titleField: "last_name", createLabel: "Create Contact", group: "main" },
  { key: "accounts", label: "Accounts", href: "/accounts", icon: Building2, table: "accounts", titleField: "account_name", createLabel: "Create Account", group: "main" },
  { key: "deals", label: "Deals", href: "/deals", icon: Handshake, table: "deals", titleField: "deal_name", createLabel: "Create Deal", group: "main" },
  { key: "tasks", label: "Tasks", href: "/tasks", icon: CheckSquare, table: "tasks", titleField: "subject", createLabel: "Create Task", group: "main" },
  { key: "meetings", label: "Meetings", href: "/meetings", icon: Calendar, table: "meetings", titleField: "title", createLabel: "Create Meeting", group: "main" },
  { key: "calls", label: "Calls", href: "/calls", icon: Phone, table: "calls", titleField: "subject", createLabel: "Log a Call", group: "main" },
  { key: "reports", label: "Reports", href: "/reports", icon: BarChart3, group: "main" },
  { key: "analytics", label: "Analytics", href: "/analytics", icon: PieChart, group: "main" },
  { key: "products", label: "Products", href: "/products", icon: Package, table: "products", titleField: "product_name", createLabel: "Create Product", group: "inventory" },
  { key: "quotes", label: "Quotes", href: "/quotes", icon: FileText, table: "quotes", titleField: "subject", createLabel: "Create Quote", group: "inventory" },
  { key: "sales-orders", label: "Sales Orders", href: "/sales-orders", icon: ShoppingCart, table: "sales_orders", titleField: "subject", createLabel: "Create Sales Order", group: "inventory" },
  { key: "purchase-orders", label: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList, table: "purchase_orders", titleField: "subject", createLabel: "Create Purchase Order", group: "inventory" },
  { key: "invoices", label: "Invoices", href: "/invoices", icon: Receipt, table: "invoices", titleField: "subject", createLabel: "Create Invoice", group: "inventory" },
  { key: "campaigns", label: "Campaigns", href: "/campaigns", icon: Megaphone, table: "campaigns", titleField: "campaign_name", createLabel: "Create Campaign", group: "other" },
  { key: "vendors", label: "Vendors", href: "/vendors", icon: Truck, table: "vendors", titleField: "vendor_name", createLabel: "Create Vendor", group: "other" },
  { key: "price-books", label: "Price Books", href: "/price-books", icon: BookOpen, table: "price_books", titleField: "price_book_name", createLabel: "Create Price Book", group: "inventory" },
  { key: "cases", label: "Cases", href: "/cases", icon: LifeBuoy, table: "cases", titleField: "subject", createLabel: "Create Case", group: "support" },
  { key: "solutions", label: "Solutions", href: "/solutions", icon: Lightbulb, table: "solutions", titleField: "solution_title", createLabel: "Create Solution", group: "support" },
  { key: "documents", label: "Documents", href: "/documents", icon: FolderOpen, table: "documents", titleField: "title", createLabel: "Create Document", group: "other" },
  { key: "forecasts", label: "Forecasts", href: "/forecasts", icon: TrendingUp, table: "forecasts", titleField: "forecast_name", createLabel: "Create Forecast", group: "other" },
  { key: "visits", label: "Visits", href: "/visits", icon: MapPin, group: "other" },
  { key: "social", label: "Social", href: "/social", icon: Share2, group: "other" },
  { key: "sheets", label: "Sheets", href: "/sheets", icon: Table2, group: "other" },
  { key: "feeds", label: "Feeds", href: "/feeds", icon: Rss, group: "other" },
  { key: "projects", label: "Projects", href: "/projects", icon: FolderKanban, group: "other" },
  { key: "my-jobs", label: "My Jobs", href: "/my-jobs", icon: Briefcase, group: "other" },
  { key: "approvals", label: "Approvals", href: "/approvals", icon: BadgeCheck, group: "other" },
  { key: "salesinbox", label: "SalesInbox", href: "/salesinbox", icon: Mail, group: "other" },
  { key: "marketplace", label: "Marketplace", href: "/marketplace", icon: Package, group: "other" },
  { key: "screens", label: "All Screens", href: "/screens", icon: Table2, group: "other" },
  { key: "setup", label: "Setup", href: "/setup", icon: Settings, group: "other" },
];

export function getModule(key: string) {
  return MODULES.find((m) => m.key === key);
}
