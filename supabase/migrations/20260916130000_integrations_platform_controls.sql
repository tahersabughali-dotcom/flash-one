-- Phase 4: integrations, platform settings, communications, import, incidents.
-- Forward only. No secrets. No fake company or provider data.

-- ---------------------------------------------------------------------------
-- Constraint expansions
-- ---------------------------------------------------------------------------

alter table public.domain_outbox_events
  drop constraint domain_outbox_events_type_check;
alter table public.domain_outbox_events
  add constraint domain_outbox_events_type_check
    check (event_type in (
      'payment.confirmed',
      'store_order.paid',
      'work_request.submitted',
      'quote.issued',
      'quote.accepted',
      'project.created',
      'project.assignment',
      'task.assignment',
      'deliverable.submitted',
      'invoice.issued',
      'payment.recorded',
      'refund.status',
      'case.created',
      'case.updated',
      'payout.approved'
    ));

alter table public.automation_rules
  drop constraint automation_rules_event_type_check;
alter table public.automation_rules
  add constraint automation_rules_event_type_check
    check (event_type in (
      'payment.confirmed',
      'store_order.paid',
      'work_request.submitted',
      'quote.issued',
      'quote.accepted',
      'project.created',
      'project.assignment',
      'task.assignment',
      'deliverable.submitted',
      'invoice.issued',
      'payment.recorded',
      'refund.status',
      'case.created',
      'case.updated',
      'payout.approved'
    ));

alter table public.automation_rules
  drop constraint automation_rules_action_type_check;
alter table public.automation_rules
  add constraint automation_rules_action_type_check
    check (action_type in (
      'create_notification',
      'create_admin_follow_up',
      'create_operational_task',
      'create_case',
      'record_activity',
      'development_fail'
    ));

alter table public.operational_communications
  drop constraint communications_source_kind_check;
alter table public.operational_communications
  add constraint communications_source_kind_check
    check (source_kind in ('platform', 'manual_record', 'verified_provider'));

alter table public.ai_conversations
  drop constraint ai_conversations_purpose_check;
alter table public.ai_conversations
  add constraint ai_conversations_purpose_check
    check (purpose in (
      'project_idea',
      'general',
      'work_request',
      'project_assistance',
      'admin_assistance'
    ));

alter table public.ai_conversations
  add column if not exists audience text not null default 'customer';
alter table public.ai_conversations
  drop constraint if exists ai_conversations_audience_check;
alter table public.ai_conversations
  add constraint ai_conversations_audience_check
    check (audience in ('customer', 'developer', 'admin'));

alter table public.ai_conversations
  add column if not exists related_project_id uuid references public.projects (id) on delete restrict;
alter table public.ai_conversations
  add column if not exists provider_code text;
alter table public.ai_conversations
  add column if not exists model_identifier text;

alter table public.ai_messages
  add column if not exists provider_code text;
alter table public.ai_messages
  add column if not exists model_identifier text;
alter table public.ai_messages
  add column if not exists confirmation_state text not null default 'none';
alter table public.ai_messages
  drop constraint if exists ai_messages_confirmation_state_check;
alter table public.ai_messages
  add constraint ai_messages_confirmation_state_check
    check (confirmation_state in ('none', 'suggested', 'confirmed', 'discarded'));

alter table public.notifications
  add column if not exists channel text not null default 'in_app';
alter table public.notifications
  drop constraint if exists notifications_channel_check;
alter table public.notifications
  add constraint notifications_channel_check
    check (channel in ('in_app', 'email', 'sms', 'whatsapp'));

-- ---------------------------------------------------------------------------
-- Integration registry (metadata only — secrets stay in environment)
-- ---------------------------------------------------------------------------

create table public.integrations (
  code text primary key,
  display_name text not null,
  category text not null,
  supported boolean not null default true,
  operational_state text not null,
  environment_label text not null default 'unknown',
  capabilities jsonb not null default '{}'::jsonb,
  configuration_requirements text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint integrations_category_check
    check (category in ('payment', 'ai', 'email', 'communication', 'other')),
  constraint integrations_state_check
    check (operational_state in (
      'supported',
      'configured',
      'enabled',
      'disabled',
      'configuration_required',
      'maintenance',
      'unavailable'
    )),
  constraint integrations_environment_check
    check (environment_label in ('unknown', 'development', 'sandbox', 'live'))
);

create trigger integrations_set_updated_at
  before update on public.integrations
  for each row
  execute function public.set_updated_at();

comment on table public.integrations is
  'Catalog of supported integrations. Configured is runtime overlay from environment. Never store secrets. Configured is not healthy.';

insert into public.integrations (
  code, display_name, category, supported, operational_state, environment_label, capabilities, configuration_requirements, notes
) values
(
  'paypal', 'PayPal', 'payment', true, 'configuration_required', 'unknown',
  '{"checkout": true, "webhook": true, "refund": true, "payout": false}'::jsonb,
  'PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID, PAYPAL_MODE',
  'Official hosted checkout. Credentials are not present. Fail closed.'
),
(
  'stripe', 'Stripe', 'payment', true, 'configuration_required', 'unknown',
  '{"checkout": true, "webhook": true, "refund": true, "payout": false}'::jsonb,
  'STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET',
  'Official Checkout Session / PaymentIntent. Credentials are not present. Fail closed.'
),
(
  'wise', 'Wise', 'payment', true, 'configuration_required', 'unknown',
  '{"checkout": false, "webhook": false, "refund": false, "payout": true, "balance": true, "transaction_import": true}'::jsonb,
  'WISE_API_TOKEN',
  'Not a Stripe-style checkout. Official Wise business/API capability only. No fabricated checkout.'
),
(
  'worldfirst', 'WorldFirst', 'payment', true, 'configuration_required', 'unknown',
  '{"checkout": false, "webhook": false, "refund": false, "payout": false, "business_only": true}'::jsonb,
  'WORLDFIRST_API_TOKEN',
  'Business-customer eligibility remains. Public API features are not assumed.'
),
(
  'usdt', 'USDT', 'payment', true, 'configuration_required', 'unknown',
  '{"checkout": false, "webhook": false, "refund": false, "payout": false, "crypto_reference": true}'::jsonb,
  'USDT_TRON_ADDRESS, USDT_ETHEREUM_ADDRESS',
  'No private key, seed phrase, or live wallet. Automatic chain monitoring is not enabled.'
),
(
  'openai', 'OpenAI', 'ai', true, 'configuration_required', 'unknown',
  '{"ai_chat": true, "ai_structured_suggestion": true}'::jsonb,
  'OPENAI_API_KEY',
  'Assistive only. No autonomous money, refund, payout, or credential actions.'
),
(
  'anthropic', 'Anthropic', 'ai', true, 'configuration_required', 'unknown',
  '{"ai_chat": true, "ai_structured_suggestion": true}'::jsonb,
  'ANTHROPIC_API_KEY',
  'Assistive only. No autonomous money, refund, payout, or credential actions.'
),
(
  'email', 'Email provider', 'email', true, 'configuration_required', 'unknown',
  '{"email_sending": true, "email_receiving": false}'::jsonb,
  'EMAIL_PROVIDER, EMAIL_API_KEY, EMAIL_FROM_ADDRESS',
  'Transactional email foundation. No sending until a real provider is configured.'
),
(
  'sms', 'SMS', 'communication', true, 'unavailable', 'unknown',
  '{"sms_sending": false}'::jsonb,
  'Official SMS provider credentials',
  'Architecture only. No unofficial sending.'
),
(
  'whatsapp', 'WhatsApp', 'communication', true, 'unavailable', 'unknown',
  '{"whatsapp_sending": false}'::jsonb,
  'Official WhatsApp Business API credentials',
  'Architecture only. No scraping, browser automation, or unofficial sending.'
);

create table public.usdt_network_settings (
  network text primary key,
  asset text not null default 'USDT',
  decimals integer not null default 6,
  confirmation_requirement integer not null default 20,
  address_configured boolean not null default false,
  wallet_enabled boolean not null default false,
  notes text,
  updated_at timestamptz not null default now(),
  constraint usdt_network_check check (network in ('TRON', 'ETHEREUM')),
  constraint usdt_decimals_check check (decimals = 6),
  constraint usdt_wallet_disabled_check check (wallet_enabled = false)
);

create trigger usdt_network_settings_set_updated_at
  before update on public.usdt_network_settings
  for each row
  execute function public.set_updated_at();

insert into public.usdt_network_settings (network, notes)
values
  ('TRON', 'TRC-20 USDT. Wallet disabled. Address is not stored here.'),
  ('ETHEREUM', 'ERC-20 USDT. Wallet disabled. Address is not stored here.');

-- ---------------------------------------------------------------------------
-- Company / brand / localization / flags
-- ---------------------------------------------------------------------------

create table public.company_settings (
  singleton boolean primary key default true check (singleton),
  legal_company_name text,
  trading_name text,
  company_number text,
  registered_address text,
  country_code text,
  vat_registered boolean,
  vat_number text,
  public_email text,
  public_phone text,
  website text,
  support_contact text,
  updated_at timestamptz not null default now(),
  updated_by_user_id uuid references auth.users (id) on delete restrict,
  constraint company_text_length_check check (
    (legal_company_name is null or char_length(legal_company_name) between 1 and 160)
    and (trading_name is null or char_length(trading_name) between 1 and 160)
    and (company_number is null or char_length(company_number) between 1 and 80)
    and (registered_address is null or char_length(registered_address) between 1 and 400)
    and (vat_number is null or char_length(vat_number) between 1 and 40)
    and (public_email is null or char_length(public_email) between 3 and 160)
    and (public_phone is null or char_length(public_phone) between 1 and 40)
    and (website is null or char_length(website) between 1 and 200)
    and (support_contact is null or char_length(support_contact) between 1 and 160)
  )
);

create trigger company_settings_set_updated_at
  before update on public.company_settings
  for each row
  execute function public.set_updated_at();

insert into public.company_settings (singleton, trading_name, website)
values (true, 'Flash One', 'https://www.flashone.uk');

comment on table public.company_settings is
  'Verified brand/domain only. Unknown legal fields stay blank. Do not invent company number, VAT, address, or phone.';

create table public.brand_settings (
  singleton boolean primary key default true check (singleton),
  brand_name text not null default 'Flash One',
  website text not null default 'https://www.flashone.uk',
  logo_path text not null default '/brand/flash-one-logo.png',
  invoice_branding_name text not null default 'Flash One',
  updated_at timestamptz not null default now(),
  updated_by_user_id uuid references auth.users (id) on delete restrict,
  constraint brand_logo_path_check check (logo_path = '/brand/flash-one-logo.png'),
  constraint brand_name_length_check check (char_length(brand_name) between 1 and 80)
);

create trigger brand_settings_set_updated_at
  before update on public.brand_settings
  for each row
  execute function public.set_updated_at();

insert into public.brand_settings (singleton)
values (true);

comment on table public.brand_settings is
  'Official Flash One identity. Logo path is the existing official file and cannot be replaced with arbitrary HTML.';

create table public.platform_currencies (
  code text primary key,
  name text not null,
  minor_unit_decimals integer not null,
  enabled boolean not null default true,
  display_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_currencies_code_check check (code in ('GBP', 'USD', 'EUR')),
  constraint platform_currencies_decimals_check check (minor_unit_decimals = 2)
);

create trigger platform_currencies_set_updated_at
  before update on public.platform_currencies
  for each row
  execute function public.set_updated_at();

insert into public.platform_currencies (code, name, minor_unit_decimals, display_order)
values
  ('GBP', 'Pound sterling', 2, 1),
  ('USD', 'US dollar', 2, 2),
  ('EUR', 'Euro', 2, 3);

comment on table public.platform_currencies is
  'No FX rates. Decimal semantics are fixed for currencies that already have financial records.';

create table public.platform_countries (
  code text primary key,
  display_name text not null,
  region text,
  enabled boolean not null default true,
  has_office boolean not null default false,
  created_at timestamptz not null default now(),
  constraint platform_countries_code_format check (code ~ '^[A-Z]{2}$'),
  constraint platform_countries_no_fake_office check (has_office = false)
);

insert into public.platform_countries (code, display_name, region) values
  ('GB', 'United Kingdom', 'Europe'),
  ('US', 'United States', 'Americas'),
  ('AE', 'United Arab Emirates', 'Middle East'),
  ('SA', 'Saudi Arabia', 'Middle East'),
  ('QA', 'Qatar', 'Middle East'),
  ('KW', 'Kuwait', 'Middle East'),
  ('BH', 'Bahrain', 'Middle East'),
  ('OM', 'Oman', 'Middle East'),
  ('JO', 'Jordan', 'Middle East'),
  ('IQ', 'Iraq', 'Middle East'),
  ('LB', 'Lebanon', 'Middle East'),
  ('EG', 'Egypt', 'Africa'),
  ('TR', 'Türkiye', 'Europe'),
  ('DE', 'Germany', 'Europe'),
  ('FR', 'France', 'Europe'),
  ('IE', 'Ireland', 'Europe'),
  ('NL', 'Netherlands', 'Europe'),
  ('IT', 'Italy', 'Europe'),
  ('ES', 'Spain', 'Europe'),
  ('AU', 'Australia', 'Oceania'),
  ('CA', 'Canada', 'Americas'),
  ('IN', 'India', 'Asia'),
  ('PK', 'Pakistan', 'Asia'),
  ('SG', 'Singapore', 'Asia'),
  ('MY', 'Malaysia', 'Asia'),
  ('NG', 'Nigeria', 'Africa'),
  ('ZA', 'South Africa', 'Africa'),
  ('KE', 'Kenya', 'Africa'),
  ('BR', 'Brazil', 'Americas'),
  ('MX', 'Mexico', 'Americas');

comment on table public.platform_countries is
  'Availability list only. Enabled does not mean Flash One has an office there.';

create table public.platform_languages (
  code text primary key,
  display_name text not null,
  direction text not null,
  enabled boolean not null default true,
  is_default boolean not null default false,
  constraint platform_languages_code_check check (code in ('en', 'ar')),
  constraint platform_languages_direction_check check (direction in ('ltr', 'rtl'))
);

insert into public.platform_languages (code, display_name, direction, is_default)
values
  ('en', 'English', 'ltr', true),
  ('ar', 'Arabic', 'rtl', false);

comment on table public.platform_languages is
  'Localization foundation. Public website remains English. Full translation is not applied in this phase.';

create table public.feature_flags (
  code text primary key,
  label text not null,
  description text not null,
  enabled boolean not null default false,
  environment_scope text not null default 'all',
  updated_at timestamptz not null default now(),
  constraint feature_flags_scope_check
    check (environment_scope in ('all', 'development', 'production'))
);

create trigger feature_flags_set_updated_at
  before update on public.feature_flags
  for each row
  execute function public.set_updated_at();

insert into public.feature_flags (code, label, description, enabled, environment_scope)
values
  ('ai', 'AI workspace', 'Shows the AI workspace when a provider is actually configured. Not an authorization bypass.', true, 'all'),
  ('store', 'Store', 'Customer storefront and admin catalog. Authorization remains explicit.', true, 'all'),
  ('external_email', 'External email', 'Allows queued transactional email when an email provider is configured.', false, 'all'),
  ('provider_checkout', 'Provider checkout', 'Allows live provider checkout only when that provider is configured and enabled.', false, 'all'),
  ('operational_modules', 'Operational modules', 'Admin operations and CRM modules. Does not grant access by itself.', true, 'all'),
  ('beta_features', 'Beta features', 'Reserved for future opt-in surfaces. Disabled.', false, 'all');

comment on table public.feature_flags is
  'UI availability only. Disabling a flag is not a security boundary. Authorization remains explicit.';

create table public.platform_setting_values (
  category text not null,
  key text not null,
  value_kind text not null,
  value_text text,
  value_bool boolean,
  value_int integer,
  updated_at timestamptz not null default now(),
  updated_by_user_id uuid references auth.users (id) on delete restrict,
  primary key (category, key),
  constraint platform_setting_category_check
    check (category in (
      'general', 'commercial', 'finance', 'ai', 'integrations',
      'notifications', 'security', 'operations', 'retention'
    )),
  constraint platform_setting_kind_check
    check (value_kind in ('text', 'bool', 'int')),
  constraint platform_setting_value_shape_check check (
    (value_kind = 'text' and value_text is not null and value_bool is null and value_int is null)
    or (value_kind = 'bool' and value_bool is not null and value_text is null and value_int is null)
    or (value_kind = 'int' and value_int is not null and value_text is null and value_bool is null)
  ),
  constraint platform_setting_no_secret_keys check (
    key not ilike '%secret%'
    and key not ilike '%password%'
    and key not ilike '%token%'
    and key not ilike '%private%key%'
  )
);

create trigger platform_setting_values_set_updated_at
  before update on public.platform_setting_values
  for each row
  execute function public.set_updated_at();

insert into public.platform_setting_values (category, key, value_kind, value_text, value_bool, value_int)
values
  ('general', 'support_hours', 'text', 'Recorded inside Flash One during business operations', null, null),
  ('retention', 'ai_conversations_days', 'int', null, null, 0),
  ('retention', 'communications_days', 'int', null, null, 0),
  ('retention', 'documents_days', 'int', null, null, 0),
  ('retention', 'import_batches_days', 'int', null, null, 0),
  ('retention', 'automation_runs_days', 'int', null, null, 0),
  ('retention', 'auto_delete_enabled', 'bool', null, false, null),
  ('security', 'auth_leak_protection', 'text', 'unknown', null, null),
  ('security', 'production_environment', 'text', 'false', null, null),
  ('security', 'backup_pitr', 'text', 'unknown', null, null),
  ('security', 'recovery_validation', 'text', 'pending', null, null);

comment on table public.platform_setting_values is
  'Typed non-secret settings. No arbitrary JSON editor. Retention auto-delete stays off until a verified legal policy exists.';

create table public.backup_readiness (
  singleton boolean primary key default true check (singleton),
  backup_configured text not null default 'unknown',
  pitr_configured text not null default 'unknown',
  last_verified_restore text not null default 'unknown',
  notes text not null default 'Actual Supabase Production backup and PITR work remains launch readiness.',
  updated_at timestamptz not null default now(),
  constraint backup_readiness_values_check check (
    backup_configured in ('false', 'unknown')
    and pitr_configured in ('false', 'unknown')
    and last_verified_restore in ('unknown')
  )
);

insert into public.backup_readiness (singleton) values (true);

comment on table public.backup_readiness is
  'Launch-readiness representation only. Do not fake backup success.';

create table public.legal_document_drafts (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('LGL-'),
  document_kind text not null,
  status text not null default 'draft_internal',
  title text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint legal_document_public_id_format check (public_id ~ '^LGL-[A-F0-9]{12}$'),
  constraint legal_document_public_id_key unique (public_id),
  constraint legal_document_kind_check check (document_kind in ('privacy', 'terms', 'cookies')),
  constraint legal_document_status_check check (status = 'draft_internal')
);

create trigger legal_document_drafts_set_updated_at
  before update on public.legal_document_drafts
  for each row
  execute function public.set_updated_at();

insert into public.legal_document_drafts (document_kind, title, notes)
values
  ('privacy', 'Privacy Policy', 'Internal placeholder. Not published. Owner facts required.'),
  ('terms', 'Terms of Service', 'Internal placeholder. Not published. Owner facts required.'),
  ('cookies', 'Cookie Policy', 'Internal placeholder. Not published. Owner facts required.');

comment on table public.legal_document_drafts is
  'Admin-only placeholders. Not public legal documents.';
