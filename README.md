# Zoho-style CRM — Full System (921 screenshots)

Operational CRM cloned from the full Zoho CRM web screenshot set (`0.png`–`920.png`), backed by **Supabase** schema `zcrm`.

## Run

```bash
cd crm-system
npm install
npm run dev
```

Open **http://localhost:3000**

### Coverage maps
| URL | Purpose |
|-----|---------|
| [/screens](http://localhost:3000/screens) | **All 921 images → live route** (slider + table) |
| [/ui-states](http://localhost:3000/ui-states) | UI pattern inventory |

## What is operational

### CRM modules (list / sheet / kanban / create / edit / detail)
Leads · Contacts · Accounts · Deals · Tasks · Meetings · Calls · Products · Quotes (line items) · Sales Orders · Purchase Orders · Invoices · Campaigns · Vendors · Price Books · Cases · Solutions · Documents · Forecasts

### List power tools
- System views, search, **Filter panel**, **Sort**
- **List / Sheet (inline edit) / Kanban**
- Bulk bar: Email, Tags, Assign Owner, Create Tasks, Mass Convert, Mass Update, Print, Export, Delete
- Actions: Import wizard (3-step), Export (CSV/XLS/VCF), Pipeline wizard (Deals)

### Modals / wizards
Compose Email · Log Call · Convert Lead · Manage Tags · Change Owner · Import · Export · Mass Update · Mass Tasks · Upload Document · Create Pipeline (5 steps) · Confirm delete

### Analytics
Home dashboard · Reports folder + **Report Builder** · Analytics charts

### Extra modules
Feeds · Visits · Social · Projects · Sheets · My Jobs · Approvals · SalesInbox · Marketplace

### Setup (admin)
Personal · Company · Calendar · Users · Roles · Profiles · Sharing · Territories · Compliance · Email (11 tabs) · Channels · Templates builder · Modules/Fields · Layouts · Buttons · Pipelines · Stages · Cadences · **Workflow builder** (12 action types) · Blueprint · Recycle Bin · Audit · Storage

## Backend

- Supabase project: `qwhunliohlkkahbspfiu`
- Schema: **`zcrm`** (isolated from other public tables)
- Seed data included (leads, deals, accounts, contacts, …)
- RLS open for demo — tighten for production

## Architecture

```
src/
  app/                 # routes (63+ pages)
  components/
    GenericModule.tsx  # list/sheet/kanban/detail/form engine
    modals/            # all CRM + advanced modals
    ui/                # Modal, Dropdown, BulkBar, LineItems, EmptyState
  lib/
    supabase.ts        # client + types
    module-configs.ts  # field metadata per module
    screenshot-map.ts  # 921 PNG → route map
```

## Note on “921 images”

Screenshots are mostly micro-states of ~100 unique UI surfaces (open menus, filter chips, scrolls). Every index resolves via `/screens` to a live operational route — not 921 separate apps.
