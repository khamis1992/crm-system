/**
 * Maps all 921 Zoho CRM screenshots (0–920) to live app routes / UI states.
 * Contiguous ranges share the same operational surface (micro-states = open menus, scrolls).
 */
export type ShotRange = {
  from: number;
  to: number;
  module: string;
  state: string;
  route: string;
  action?: string;
};

export const SCREENSHOT_MAP: ShotRange[] = [
  { from: 0, to: 0, module: "Home", state: "Dashboard", route: "/" },
  { from: 1, to: 2, module: "Global", state: "Create menu / Module launcher", route: "/", action: "open-create-menu" },
  { from: 3, to: 7, module: "Leads", state: "List + bulk", route: "/leads" },
  { from: 8, to: 14, module: "Leads", state: "Detail / notes / email", route: "/leads" },
  { from: 15, to: 19, module: "Leads", state: "Create form", route: "/leads/new" },
  { from: 20, to: 27, module: "Leads", state: "Email / Call / Convert modals", route: "/leads", action: "modals" },
  { from: 28, to: 32, module: "Leads", state: "Convert + Tags + Owner", route: "/leads", action: "convert" },
  { from: 33, to: 45, module: "Deals", state: "List / Kanban / Create", route: "/deals" },
  { from: 46, to: 54, module: "Deals", state: "Detail + stage bar", route: "/deals" },
  { from: 55, to: 66, module: "Contacts", state: "List / Create / Detail", route: "/contacts" },
  { from: 67, to: 72, module: "Accounts", state: "List / Create / Detail", route: "/accounts" },
  { from: 73, to: 89, module: "Tasks/Meetings/Calls", state: "Lists + create", route: "/tasks" },
  { from: 90, to: 99, module: "Calls", state: "List + log", route: "/calls" },
  { from: 100, to: 119, module: "Reports", state: "Home + builder", route: "/reports" },
  { from: 120, to: 129, module: "Analytics", state: "Dashboard + components", route: "/analytics" },
  { from: 130, to: 155, module: "Products", state: "CRUD", route: "/products" },
  { from: 156, to: 169, module: "Campaigns", state: "CRUD", route: "/campaigns" },
  { from: 170, to: 199, module: "Quotes", state: "List + line items", route: "/quotes" },
  { from: 200, to: 230, module: "Sales Orders", state: "CRUD + lines", route: "/sales-orders" },
  { from: 231, to: 269, module: "Deals", state: "Kanban / Sheet / Filters", route: "/deals", action: "sheet-filter" },
  { from: 270, to: 302, module: "Pipelines", state: "Create Pipeline wizard", route: "/setup/pipelines", action: "wizard" },
  { from: 303, to: 335, module: "Deals", state: "Mass Update / Actions", route: "/deals", action: "mass-update" },
  { from: 336, to: 377, module: "Deals", state: "Tags system", route: "/deals", action: "tags" },
  { from: 378, to: 392, module: "Deals", state: "Export + Print", route: "/deals", action: "export" },
  { from: 393, to: 460, module: "Deals", state: "Detail related lists + modals", route: "/deals" },
  { from: 250, to: 280, module: "Purchase Orders", state: "CRUD", route: "/purchase-orders" },
  { from: 280, to: 299, module: "Invoices", state: "CRUD", route: "/invoices" },
  { from: 300, to: 330, module: "Vendors/Price Books", state: "CRUD", route: "/vendors" },
  { from: 350, to: 410, module: "Campaigns/Cases", state: "CRUD", route: "/cases" },
  { from: 420, to: 449, module: "Solutions", state: "CRUD", route: "/solutions" },
  { from: 450, to: 479, module: "Documents", state: "Library + upload", route: "/documents" },
  { from: 480, to: 499, module: "Forecasts", state: "Matrix", route: "/forecasts" },
  { from: 500, to: 529, module: "Visits/Projects", state: "Empty + create", route: "/visits" },
  { from: 530, to: 560, module: "Social", state: "Brands empty", route: "/social" },
  { from: 561, to: 590, module: "Feeds", state: "Activity stream", route: "/feeds" },
  { from: 591, to: 620, module: "My Jobs", state: "Job monitor", route: "/my-jobs" },
  { from: 621, to: 650, module: "Approvals", state: "Queues", route: "/approvals" },
  { from: 651, to: 689, module: "Sheets", state: "Sheet hub", route: "/sheets" },
  { from: 461, to: 529, module: "Setup", state: "Modules organize + builder", route: "/setup/modules-fields" },
  { from: 530, to: 592, module: "Setup", state: "Pipelines list + builder", route: "/setup/pipelines" },
  { from: 593, to: 690, module: "Setup", state: "Stage-Probability mapping", route: "/setup/stages" },
  { from: 691, to: 693, module: "Setup", state: "Setup home", route: "/setup" },
  { from: 694, to: 696, module: "Setup", state: "Personal Settings", route: "/setup/personal" },
  { from: 697, to: 699, module: "Setup", state: "Company Details", route: "/setup/company" },
  { from: 700, to: 702, module: "Setup", state: "Calendar Preference", route: "/setup/calendar" },
  { from: 703, to: 705, module: "Setup", state: "Users + Add User", route: "/setup/users" },
  { from: 706, to: 717, module: "Setup", state: "Profiles", route: "/setup/profiles" },
  { from: 718, to: 726, module: "Setup", state: "Roles tree", route: "/setup/roles" },
  { from: 727, to: 732, module: "Setup", state: "Territory + Compliance promo", route: "/setup/territories" },
  { from: 733, to: 765, module: "Setup", state: "Email configuration tabs", route: "/setup/email" },
  { from: 766, to: 774, module: "Setup", state: "Chat / Messaging / Portals", route: "/setup/channels" },
  { from: 775, to: 840, module: "Setup", state: "Customization modules/fields/buttons", route: "/setup/modules-fields" },
  { from: 841, to: 864, module: "Setup", state: "Email & Inventory templates", route: "/setup/templates" },
  { from: 865, to: 920, module: "Setup", state: "Workflow builder + actions", route: "/setup/workflows" },
  { from: 168, to: 170, module: "Marketplace", state: "Catalog", route: "/marketplace" },
];

export function resolveShot(index: number): ShotRange {
  const hits = SCREENSHOT_MAP.filter((r) => index >= r.from && index <= r.to);
  if (hits.length) return hits[hits.length - 1];
  // fallback band by thirds
  if (index < 230) return { from: index, to: index, module: "CRM", state: "Core modules", route: "/leads" };
  if (index < 460) return { from: index, to: index, module: "Deals", state: "Pipeline ops", route: "/deals" };
  if (index < 690) return { from: index, to: index, module: "Setup", state: "Customization", route: "/setup" };
  return { from: index, to: index, module: "Setup", state: "Admin/Automation", route: "/setup" };
}

export const TOTAL_SHOTS = 921;
