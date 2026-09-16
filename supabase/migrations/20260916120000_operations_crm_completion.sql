-- Phase 3: operations, CRM, communications, and management foundation.
-- Forward only. Does not rewrite Payment Core, invoices, receipts, or ingest.

-- ---------------------------------------------------------------------------
-- People and network
-- ---------------------------------------------------------------------------
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('EMP-'),
  display_name text not null,
  email text,
  job_title text,
  department text,
  status text not null default 'active',
  start_date date,
  user_id uuid unique references auth.users (id) on delete restrict,
  internal_notes text,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employees_name_length_check check (char_length(display_name) between 1 and 120),
  constraint employees_email_length_check check (email is null or char_length(email) between 3 and 160),
  constraint employees_title_length_check check (job_title is null or char_length(job_title) between 1 and 120),
  constraint employees_department_length_check check (department is null or char_length(department) between 1 and 120),
  constraint employees_notes_length_check check (internal_notes is null or char_length(internal_notes) between 1 and 4000),
  constraint employees_status_check check (status in ('active', 'inactive')),
  constraint employees_public_id_format_check check (public_id ~ '^EMP-[A-F0-9]{12}$'),
  constraint employees_public_id_key unique (public_id)
);

comment on table public.employees is
  'Operational employee record. Not payroll. Linked auth user does not grant platform admin.';

create trigger employees_set_updated_at
  before update on public.employees
  for each row execute function public.set_updated_at();

create table public.freelancers (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('FLR-'),
  display_name text not null,
  email text,
  specialty text,
  country text,
  status text not null default 'active',
  developer_user_id uuid references public.developer_profiles (user_id) on delete restrict,
  internal_notes text,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint freelancers_name_length_check check (char_length(display_name) between 1 and 120),
  constraint freelancers_email_length_check check (email is null or char_length(email) between 3 and 160),
  constraint freelancers_specialty_length_check check (specialty is null or char_length(specialty) between 1 and 160),
  constraint freelancers_country_length_check check (country is null or char_length(country) between 1 and 80),
  constraint freelancers_notes_length_check check (internal_notes is null or char_length(internal_notes) between 1 and 4000),
  constraint freelancers_status_check check (status in ('active', 'inactive', 'archived')),
  constraint freelancers_public_id_format_check check (public_id ~ '^FLR-[A-F0-9]{12}$'),
  constraint freelancers_public_id_key unique (public_id)
);

comment on table public.freelancers is
  'Freelancer commercial relationship. Separate from developer_profiles even when linked.';

create trigger freelancers_set_updated_at
  before update on public.freelancers
  for each row execute function public.set_updated_at();

create table public.partner_companies (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('PAR-'),
  name text not null,
  relationship_type text not null,
  capabilities text,
  website text,
  country text,
  status text not null default 'active',
  internal_notes text,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partners_name_length_check check (char_length(name) between 1 and 160),
  constraint partners_capabilities_length_check check (capabilities is null or char_length(capabilities) between 1 and 4000),
  constraint partners_website_length_check check (website is null or char_length(website) between 1 and 200),
  constraint partners_country_length_check check (country is null or char_length(country) between 1 and 80),
  constraint partners_notes_length_check check (internal_notes is null or char_length(internal_notes) between 1 and 4000),
  constraint partners_type_check check (relationship_type in (
    'delivery_partner', 'referral_partner', 'technology_partner', 'subcontractor', 'other'
  )),
  constraint partners_status_check check (status in ('active', 'inactive', 'archived')),
  constraint partners_public_id_format_check check (public_id ~ '^PAR-[A-F0-9]{12}$'),
  constraint partners_public_id_key unique (public_id)
);

comment on table public.partner_companies is
  'Internal partner company records. Not a public partnership claim.';

create trigger partner_companies_set_updated_at
  before update on public.partner_companies
  for each row execute function public.set_updated_at();

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('SUP-'),
  name text not null,
  supplier_type text not null,
  status text not null default 'active',
  internal_notes text,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suppliers_name_length_check check (char_length(name) between 1 and 160),
  constraint suppliers_notes_length_check check (internal_notes is null or char_length(internal_notes) between 1 and 4000),
  constraint suppliers_type_check check (supplier_type in (
    'software_vendor',
    'hosting_infrastructure',
    'freelancer_supplier',
    'consultant',
    'professional_service',
    'other'
  )),
  constraint suppliers_status_check check (status in ('active', 'inactive', 'archived')),
  constraint suppliers_public_id_format_check check (public_id ~ '^SUP-[A-F0-9]{12}$'),
  constraint suppliers_public_id_key unique (public_id)
);

comment on table public.suppliers is
  'Suppliers Flash One buys from. Separate from customers and partner companies.';

create trigger suppliers_set_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('CON-'),
  display_name text not null,
  job_title text,
  email text,
  phone text,
  owner_kind text not null,
  organization_id uuid references public.organizations (id) on delete restrict,
  partner_id uuid references public.partner_companies (id) on delete restrict,
  supplier_id uuid references public.suppliers (id) on delete restrict,
  status text not null default 'active',
  internal_notes text,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_name_length_check check (char_length(display_name) between 1 and 120),
  constraint contacts_title_length_check check (job_title is null or char_length(job_title) between 1 and 120),
  constraint contacts_email_length_check check (email is null or char_length(email) between 3 and 160),
  constraint contacts_phone_length_check check (phone is null or char_length(phone) between 1 and 40),
  constraint contacts_notes_length_check check (internal_notes is null or char_length(internal_notes) between 1 and 4000),
  constraint contacts_owner_kind_check check (owner_kind in ('organization', 'partner', 'supplier', 'other')),
  constraint contacts_owner_xor_check check (
    (owner_kind = 'organization' and organization_id is not null and partner_id is null and supplier_id is null)
    or (owner_kind = 'partner' and partner_id is not null and organization_id is null and supplier_id is null)
    or (owner_kind = 'supplier' and supplier_id is not null and organization_id is null and partner_id is null)
    or (owner_kind = 'other' and organization_id is null and partner_id is null and supplier_id is null)
  ),
  constraint contacts_status_check check (status in ('active', 'archived')),
  constraint contacts_public_id_format_check check (public_id ~ '^CON-[A-F0-9]{12}$'),
  constraint contacts_public_id_key unique (public_id)
);

comment on table public.contacts is
  'Internal contact registry. Not a public directory.';

create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

create index contacts_organization_id_idx on public.contacts (organization_id);
create index contacts_partner_id_idx on public.contacts (partner_id);
create index contacts_supplier_id_idx on public.contacts (supplier_id);

-- ---------------------------------------------------------------------------
-- Procurement, expenses, payouts, referrals, commissions
-- ---------------------------------------------------------------------------
create table public.procurement_purchases (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('PRC-'),
  supplier_id uuid not null references public.suppliers (id) on delete restrict,
  description text not null,
  currency text not null,
  amount_minor bigint not null,
  status text not null default 'draft',
  purchase_date date,
  due_date date,
  project_id uuid references public.projects (id) on delete restrict,
  document_id uuid,
  internal_notes text,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint procurement_description_length_check check (char_length(description) between 1 and 400),
  constraint procurement_notes_length_check check (internal_notes is null or char_length(internal_notes) between 1 and 4000),
  constraint procurement_currency_check check (currency in ('GBP', 'USD', 'EUR')),
  constraint procurement_amount_check check (amount_minor >= 0 and amount_minor <= 9999999900),
  constraint procurement_status_check check (status in ('draft', 'ordered', 'received', 'cancelled', 'recorded')),
  constraint procurement_public_id_format_check check (public_id ~ '^PRC-[A-F0-9]{12}$'),
  constraint procurement_public_id_key unique (public_id)
);

comment on table public.procurement_purchases is
  'Flash One buying something. Not customer revenue and not automatically paid.';

create trigger procurement_purchases_set_updated_at
  before update on public.procurement_purchases
  for each row execute function public.set_updated_at();

create index procurement_purchases_supplier_id_idx on public.procurement_purchases (supplier_id);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('EXP-'),
  category text not null,
  description text not null,
  currency text not null,
  amount_minor bigint not null,
  expense_date date not null,
  status text not null default 'draft',
  supplier_id uuid references public.suppliers (id) on delete restrict,
  employee_id uuid references public.employees (id) on delete restrict,
  freelancer_id uuid references public.freelancers (id) on delete restrict,
  partner_id uuid references public.partner_companies (id) on delete restrict,
  project_id uuid references public.projects (id) on delete restrict,
  procurement_id uuid references public.procurement_purchases (id) on delete restrict,
  document_id uuid,
  internal_notes text,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_category_check check (category in (
    'software', 'services', 'freelance', 'infrastructure', 'consulting', 'operations', 'other'
  )),
  constraint expenses_description_length_check check (char_length(description) between 1 and 400),
  constraint expenses_notes_length_check check (internal_notes is null or char_length(internal_notes) between 1 and 4000),
  constraint expenses_currency_check check (currency in ('GBP', 'USD', 'EUR')),
  constraint expenses_amount_check check (amount_minor >= 0 and amount_minor <= 9999999900),
  constraint expenses_status_check check (status in ('draft', 'submitted', 'approved', 'recorded', 'cancelled')),
  constraint expenses_public_id_format_check check (public_id ~ '^EXP-[A-F0-9]{12}$'),
  constraint expenses_public_id_key unique (public_id)
);

comment on table public.expenses is
  'Operational expenses. Separate from customer invoices. Recorded is not paid.';

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('PYO-'),
  beneficiary_kind text not null,
  employee_id uuid references public.employees (id) on delete restrict,
  freelancer_id uuid references public.freelancers (id) on delete restrict,
  supplier_id uuid references public.suppliers (id) on delete restrict,
  partner_id uuid references public.partner_companies (id) on delete restrict,
  amount_minor bigint not null,
  currency text not null,
  reason text not null,
  status text not null default 'draft',
  due_date date,
  paid_at timestamptz,
  payment_method_description text,
  reference_text text,
  project_id uuid references public.projects (id) on delete restrict,
  expense_id uuid references public.expenses (id) on delete restrict,
  procurement_id uuid references public.procurement_purchases (id) on delete restrict,
  internal_notes text,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payouts_beneficiary_kind_check check (beneficiary_kind in ('employee', 'freelancer', 'supplier', 'partner')),
  constraint payouts_beneficiary_xor_check check (
    (beneficiary_kind = 'employee' and employee_id is not null and freelancer_id is null and supplier_id is null and partner_id is null)
    or (beneficiary_kind = 'freelancer' and freelancer_id is not null and employee_id is null and supplier_id is null and partner_id is null)
    or (beneficiary_kind = 'supplier' and supplier_id is not null and employee_id is null and freelancer_id is null and partner_id is null)
    or (beneficiary_kind = 'partner' and partner_id is not null and employee_id is null and freelancer_id is null and supplier_id is null)
  ),
  constraint payouts_amount_check check (amount_minor > 0 and amount_minor <= 9999999900),
  constraint payouts_currency_check check (currency in ('GBP', 'USD', 'EUR')),
  constraint payouts_reason_length_check check (char_length(reason) between 1 and 400),
  constraint payouts_method_length_check check (payment_method_description is null or char_length(payment_method_description) between 1 and 160),
  constraint payouts_reference_length_check check (reference_text is null or char_length(reference_text) between 1 and 160),
  constraint payouts_notes_length_check check (internal_notes is null or char_length(internal_notes) between 1 and 4000),
  constraint payouts_status_check check (status in ('draft', 'approved', 'pending', 'paid_manual', 'cancelled')),
  constraint payouts_paid_manual_check check (
    (status = 'paid_manual' and paid_at is not null and payment_method_description is not null)
    or status <> 'paid_manual'
  ),
  constraint payouts_public_id_format_check check (public_id ~ '^PYO-[A-F0-9]{12}$'),
  constraint payouts_public_id_key unique (public_id)
);

comment on table public.payouts is
  'Provider-independent payable. paid_manual requires a truthful method description. Separate from customer Payments.';

create trigger payouts_set_updated_at
  before update on public.payouts
  for each row execute function public.set_updated_at();

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('RFR-'),
  source_kind text not null,
  employee_id uuid references public.employees (id) on delete restrict,
  freelancer_id uuid references public.freelancers (id) on delete restrict,
  partner_id uuid references public.partner_companies (id) on delete restrict,
  source_label text,
  individual_user_id uuid references public.individual_accounts (user_id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete restrict,
  project_id uuid references public.projects (id) on delete restrict,
  internal_notes text,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint referrals_source_kind_check check (source_kind in ('employee', 'freelancer', 'partner', 'other')),
  constraint referrals_label_length_check check (source_label is null or char_length(source_label) between 1 and 160),
  constraint referrals_notes_length_check check (internal_notes is null or char_length(internal_notes) between 1 and 4000),
  constraint referrals_public_id_format_check check (public_id ~ '^RFR-[A-F0-9]{12}$'),
  constraint referrals_public_id_key unique (public_id)
);

comment on table public.referrals is
  'Referral relationship foundation. Does not automatically create commission.';

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('CMN-'),
  referral_id uuid references public.referrals (id) on delete restrict,
  beneficiary_kind text not null,
  employee_id uuid references public.employees (id) on delete restrict,
  freelancer_id uuid references public.freelancers (id) on delete restrict,
  partner_id uuid references public.partner_companies (id) on delete restrict,
  calculation_type text not null,
  basis_amount_minor bigint,
  rate_bps integer,
  amount_minor bigint not null,
  currency text not null,
  status text not null default 'draft',
  reason text not null,
  project_id uuid references public.projects (id) on delete restrict,
  invoice_id uuid references public.invoices (id) on delete restrict,
  store_order_id uuid references public.store_orders (id) on delete restrict,
  payout_id uuid references public.payouts (id) on delete restrict,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commissions_beneficiary_kind_check check (beneficiary_kind in ('employee', 'freelancer', 'partner')),
  constraint commissions_calculation_check check (calculation_type in ('fixed', 'percentage')),
  constraint commissions_percentage_check check (
    (calculation_type = 'fixed' and rate_bps is null)
    or (calculation_type = 'percentage' and rate_bps is not null and rate_bps between 1 and 10000 and basis_amount_minor is not null)
  ),
  constraint commissions_amount_check check (amount_minor > 0 and amount_minor <= 9999999900),
  constraint commissions_basis_check check (basis_amount_minor is null or (basis_amount_minor >= 0 and basis_amount_minor <= 9999999900)),
  constraint commissions_currency_check check (currency in ('GBP', 'USD', 'EUR')),
  constraint commissions_reason_length_check check (char_length(reason) between 1 and 400),
  constraint commissions_status_check check (status in ('draft', 'approved', 'cancelled', 'paid')),
  constraint commissions_public_id_format_check check (public_id ~ '^CMN-[A-F0-9]{12}$'),
  constraint commissions_public_id_key unique (public_id)
);

comment on table public.commissions is
  'Explicit commission only. Percentage uses integer basis points. Not profit and not automatic.';

create trigger commissions_set_updated_at
  before update on public.commissions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Project team, tasks, documents, communications, cases, notes, activity
-- ---------------------------------------------------------------------------
create table public.project_team_assignments (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('PTM-'),
  project_id uuid not null references public.projects (id) on delete restrict,
  member_kind text not null,
  role_label text not null,
  employee_id uuid references public.employees (id) on delete restrict,
  freelancer_id uuid references public.freelancers (id) on delete restrict,
  partner_id uuid references public.partner_companies (id) on delete restrict,
  developer_user_id uuid references public.developer_profiles (user_id) on delete restrict,
  status text not null default 'active',
  assigned_by_user_id uuid not null references auth.users (id) on delete restrict,
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_member_kind_check check (member_kind in ('employee', 'developer', 'freelancer', 'partner')),
  constraint team_role_label_check check (role_label in (
    'project_lead', 'developer', 'designer', 'consultant', 'qa', 'support', 'partner', 'other'
  )),
  constraint team_member_xor_check check (
    (member_kind = 'employee' and employee_id is not null and freelancer_id is null and partner_id is null and developer_user_id is null)
    or (member_kind = 'freelancer' and freelancer_id is not null and employee_id is null and partner_id is null and developer_user_id is null)
    or (member_kind = 'partner' and partner_id is not null and employee_id is null and freelancer_id is null and developer_user_id is null)
    or (member_kind = 'developer' and developer_user_id is not null and employee_id is null and freelancer_id is null and partner_id is null)
  ),
  constraint team_status_check check (status in ('active', 'ended')),
  constraint team_public_id_format_check check (public_id ~ '^PTM-[A-F0-9]{12}$'),
  constraint team_public_id_key unique (public_id)
);

comment on table public.project_team_assignments is
  'Operational project team. Role labels do not grant platform admin.';

create trigger project_team_assignments_set_updated_at
  before update on public.project_team_assignments
  for each row execute function public.set_updated_at();

create unique index project_team_assignments_active_employee_key
  on public.project_team_assignments (project_id, employee_id) where status = 'active' and employee_id is not null;
create unique index project_team_assignments_active_freelancer_key
  on public.project_team_assignments (project_id, freelancer_id) where status = 'active' and freelancer_id is not null;
create unique index project_team_assignments_active_partner_key
  on public.project_team_assignments (project_id, partner_id) where status = 'active' and partner_id is not null;
create unique index project_team_assignments_active_developer_key
  on public.project_team_assignments (project_id, developer_user_id) where status = 'active' and developer_user_id is not null;
create index project_team_assignments_project_id_idx on public.project_team_assignments (project_id);

alter table public.project_tasks
  add column assignee_kind text,
  add column assignee_employee_id uuid references public.employees (id) on delete restrict,
  add column assignee_freelancer_id uuid references public.freelancers (id) on delete restrict,
  add column assignee_developer_user_id uuid references public.developer_profiles (user_id) on delete restrict;

alter table public.project_tasks
  add constraint project_tasks_assignee_kind_check
    check (assignee_kind is null or assignee_kind in ('employee', 'freelancer', 'developer'));

create table public.operational_tasks (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('ITK-'),
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'normal',
  due_at timestamptz,
  completed_at timestamptz,
  project_id uuid references public.projects (id) on delete restrict,
  individual_user_id uuid references public.individual_accounts (user_id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete restrict,
  invoice_id uuid references public.invoices (id) on delete restrict,
  support_case_id uuid,
  assignee_employee_id uuid references public.employees (id) on delete restrict,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint operational_tasks_title_length_check check (char_length(title) between 1 and 160),
  constraint operational_tasks_description_length_check check (description is null or char_length(description) between 1 and 4000),
  constraint operational_tasks_status_check check (status in ('todo', 'in_progress', 'blocked', 'completed', 'cancelled')),
  constraint operational_tasks_priority_check check (priority in ('low', 'normal', 'high', 'urgent')),
  constraint operational_tasks_public_id_format_check check (public_id ~ '^ITK-[A-F0-9]{12}$'),
  constraint operational_tasks_public_id_key unique (public_id)
);

comment on table public.operational_tasks is
  'Internal operational tasks. Not customer-visible.';

create trigger operational_tasks_set_updated_at
  before update on public.operational_tasks
  for each row execute function public.set_updated_at();

create index operational_tasks_status_due_idx on public.operational_tasks (status, due_at);
create index project_tasks_due_at_idx on public.project_tasks (due_at) where status in ('todo', 'in_progress', 'blocked');

create table public.operational_documents (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('DOC-'),
  title text not null,
  document_type text not null,
  entity_kind text not null,
  entity_public_id text,
  original_filename text not null,
  storage_bucket text not null default 'operational-documents',
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null,
  visibility text not null default 'internal',
  uploaded_by_user_id uuid not null references auth.users (id) on delete restrict,
  uploaded_at timestamptz not null default now(),
  internal_notes text,
  created_at timestamptz not null default now(),
  constraint documents_title_length_check check (char_length(title) between 1 and 160),
  constraint documents_filename_length_check check (char_length(original_filename) between 1 and 120),
  constraint documents_type_check check (document_type in (
    'customer', 'supplier', 'contract', 'procurement', 'expense', 'partner', 'internal', 'other'
  )),
  constraint documents_entity_kind_check check (entity_kind in (
    'customer', 'organization', 'project', 'invoice', 'order', 'partner', 'supplier',
    'employee', 'freelancer', 'case', 'expense', 'payout', 'procurement', 'contact', 'other'
  )),
  constraint documents_visibility_check check (visibility = 'internal'),
  constraint documents_bucket_check check (storage_bucket = 'operational-documents'),
  constraint documents_size_check check (size_bytes between 1 and 20971520),
  constraint documents_notes_length_check check (internal_notes is null or char_length(internal_notes) between 1 and 4000),
  constraint documents_public_id_format_check check (public_id ~ '^DOC-[A-F0-9]{12}$'),
  constraint documents_public_id_key unique (public_id),
  constraint documents_storage_path_key unique (storage_path)
);

comment on table public.operational_documents is
  'Internal Document Center metadata. Binary objects live in private bucket operational-documents. Not project delivery files.';

create table public.operational_communications (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('CMR-'),
  channel text not null,
  source_kind text not null,
  title text not null,
  body text,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  entity_kind text,
  entity_public_id text,
  individual_user_id uuid references public.individual_accounts (user_id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete restrict,
  project_id uuid references public.projects (id) on delete restrict,
  recorded_by_user_id uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint communications_channel_check check (channel in (
    'platform_conversation', 'email', 'phone', 'meeting', 'whatsapp', 'zoom', 'teams', 'sms', 'other'
  )),
  constraint communications_source_kind_check check (source_kind in ('platform', 'manual_record')),
  constraint communications_title_length_check check (char_length(title) between 1 and 160),
  constraint communications_body_length_check check (body is null or char_length(body) between 1 and 8000),
  constraint communications_public_id_format_check check (public_id ~ '^CMR-[A-F0-9]{12}$'),
  constraint communications_public_id_key unique (public_id)
);

comment on table public.operational_communications is
  'Operational communication records. External channels are manual records until integrated. occurred_at is distinct from recorded_at.';

create index operational_communications_occurred_at_idx
  on public.operational_communications (occurred_at desc);

create table public.support_cases (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('CAS-'),
  title text not null,
  case_type text not null,
  priority text not null default 'normal',
  status text not null default 'open',
  description text,
  individual_user_id uuid references public.individual_accounts (user_id) on delete restrict,
  organization_id uuid references public.organizations (id) on delete restrict,
  project_id uuid references public.projects (id) on delete restrict,
  store_order_id uuid references public.store_orders (id) on delete restrict,
  invoice_id uuid references public.invoices (id) on delete restrict,
  assigned_employee_id uuid references public.employees (id) on delete restrict,
  customer_visible boolean not null default false,
  resolved_at timestamptz,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cases_title_length_check check (char_length(title) between 1 and 160),
  constraint cases_description_length_check check (description is null or char_length(description) between 1 and 8000),
  constraint cases_type_check check (case_type in (
    'technical_support', 'billing', 'project', 'order', 'general', 'other'
  )),
  constraint cases_priority_check check (priority in ('low', 'normal', 'high', 'urgent')),
  constraint cases_status_check check (status in ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
  constraint cases_owner_check check (individual_user_id is null or organization_id is null),
  constraint cases_public_id_format_check check (public_id ~ '^CAS-[A-F0-9]{12}$'),
  constraint cases_public_id_key unique (public_id)
);

comment on table public.support_cases is
  'Lightweight support/case records. Internal notes remain separate and never customer-visible.';

create trigger support_cases_set_updated_at
  before update on public.support_cases
  for each row execute function public.set_updated_at();

create index support_cases_status_idx on public.support_cases (status, created_at desc);

alter table public.operational_tasks
  add constraint operational_tasks_support_case_fk
    foreign key (support_case_id) references public.support_cases (id) on delete restrict;

create table public.support_case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.support_cases (id) on delete restrict,
  event_type text not null,
  summary text not null,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint case_events_type_check check (event_type in ('created', 'status_changed', 'assigned', 'note', 'communication')),
  constraint case_events_summary_length_check check (char_length(summary) between 1 and 400)
);

create index support_case_events_case_id_idx on public.support_case_events (case_id, created_at);

create table public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('NTE-'),
  entity_kind text not null,
  entity_public_id text not null,
  content text not null,
  created_by_user_id uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint notes_entity_kind_check check (entity_kind in (
    'customer', 'organization', 'project', 'invoice', 'order', 'partner', 'supplier',
    'employee', 'freelancer', 'case', 'expense', 'payout', 'procurement', 'contact', 'other'
  )),
  constraint notes_content_length_check check (char_length(content) between 1 and 8000),
  constraint notes_public_id_format_check check (public_id ~ '^NTE-[A-F0-9]{12}$'),
  constraint notes_public_id_key unique (public_id)
);

comment on table public.internal_notes is
  'Internal notes. Never customer-visible.';

create index internal_notes_entity_idx on public.internal_notes (entity_kind, entity_public_id, created_at desc);

create table public.operational_activity (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  entity_kind text not null,
  entity_public_id text not null,
  summary text not null,
  actor_user_id uuid references auth.users (id) on delete restrict,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint activity_summary_length_check check (char_length(summary) between 1 and 400)
);

comment on table public.operational_activity is
  'Append-only operational timeline events. Does not manufacture missing history.';

create index operational_activity_entity_idx
  on public.operational_activity (entity_kind, entity_public_id, occurred_at desc);

alter table public.expenses
  add constraint expenses_document_fk
    foreign key (document_id) references public.operational_documents (id) on delete restrict;
alter table public.procurement_purchases
  add constraint procurement_document_fk
    foreign key (document_id) references public.operational_documents (id) on delete restrict;

-- ---------------------------------------------------------------------------
-- Ledger + notification type extensions
-- ---------------------------------------------------------------------------
alter table public.financial_ledger_entries
  drop constraint financial_ledger_entries_event_type_check;
alter table public.financial_ledger_entries
  add constraint financial_ledger_entries_event_type_check
    check (event_type in (
      'manual_payment_recorded',
      'payment_received',
      'payment_allocated',
      'refund_recorded',
      'credit_note_issued',
      'adjustment_recorded',
      'expense_recorded',
      'payout_recorded'
    ));

alter table public.notifications
  drop constraint notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check
    check (type in (
      'store_order_paid',
      'work_request_submitted',
      'admin_follow_up',
      'automation',
      'project_assignment',
      'task_assignment',
      'case_update',
      'deliverable_submitted',
      'invoice_issued',
      'payment_recorded',
      'payout_approved'
    ));
