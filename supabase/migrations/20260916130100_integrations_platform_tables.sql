-- Phase 4 remaining operational tables.

create table public.notification_channels (
  code text primary key,
  display_name text not null,
  operational_state text not null,
  notes text,
  updated_at timestamptz not null default now(),
  constraint notification_channels_code_check check (code in ('in_app', 'email', 'sms', 'whatsapp')),
  constraint notification_channels_state_check
    check (operational_state in ('enabled', 'configuration_required', 'unavailable', 'disabled'))
);

create trigger notification_channels_set_updated_at
  before update on public.notification_channels
  for each row
  execute function public.set_updated_at();

insert into public.notification_channels (code, display_name, operational_state, notes)
values
  ('in_app', 'In-app', 'enabled', 'Current operational channel.'),
  ('email', 'Email', 'configuration_required', 'No provider. Do not mark messages sent.'),
  ('sms', 'SMS', 'unavailable', 'Official provider required. Architecture only.'),
  ('whatsapp', 'WhatsApp', 'unavailable', 'Official WhatsApp Business API required. Architecture only.');

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('NDL-'),
  notification_id uuid references public.notifications (id) on delete restrict,
  channel text not null,
  status text not null,
  provider_code text,
  provider_message_id text,
  error_summary text,
  queued_at timestamptz not null default now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notification_deliveries_public_id_format check (public_id ~ '^NDL-[A-F0-9]{12}$'),
  constraint notification_deliveries_public_id_key unique (public_id),
  constraint notification_deliveries_channel_check check (channel in ('email', 'sms', 'whatsapp')),
  constraint notification_deliveries_status_check
    check (status in ('queued', 'sending', 'sent', 'delivered', 'failed', 'unavailable'))
);

create index notification_deliveries_notification_id_idx
  on public.notification_deliveries (notification_id);

comment on table public.notification_deliveries is
  'External notification lifecycle. Statuses require real provider evidence. No provider means unavailable.';

create table public.email_messages (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('EML-'),
  template_code text not null,
  recipient_user_id uuid references auth.users (id) on delete restrict,
  recipient_email text,
  subject text not null,
  status text not null default 'unavailable',
  provider_code text,
  related_entity_kind text,
  related_entity_public_id text,
  error_summary text,
  created_at timestamptz not null default now(),
  queued_at timestamptz,
  sent_at timestamptz,
  created_by_user_id uuid references auth.users (id) on delete restrict,
  constraint email_messages_public_id_format check (public_id ~ '^EML-[A-F0-9]{12}$'),
  constraint email_messages_public_id_key unique (public_id),
  constraint email_messages_template_check check (template_code in (
    'account', 'project_notification', 'invoice_issued', 'payment_receipt', 'case_update'
  )),
  constraint email_messages_status_check check (status in (
    'unavailable', 'queued', 'sending', 'sent', 'delivered', 'failed', 'cancelled'
  )),
  constraint email_messages_subject_length check (char_length(subject) between 1 and 180)
);

create index email_messages_created_at_idx on public.email_messages (created_at desc);

comment on table public.email_messages is
  'Transactional email records. Without a provider, status remains unavailable. Not a marketing system.';

create table public.outbound_webhook_subscriptions (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('OWH-'),
  name text not null,
  destination_host text not null,
  enabled boolean not null default false,
  event_allowlist text[] not null default '{}',
  status text not null default 'disabled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_user_id uuid references auth.users (id) on delete restrict,
  constraint outbound_webhook_public_id_format check (public_id ~ '^OWH-[A-F0-9]{12}$'),
  constraint outbound_webhook_public_id_key unique (public_id),
  constraint outbound_webhook_status_check check (status in ('disabled', 'configuration_required', 'enabled')),
  constraint outbound_webhook_default_disabled check (enabled = false)
);

create trigger outbound_webhook_subscriptions_set_updated_at
  before update on public.outbound_webhook_subscriptions
  for each row
  execute function public.set_updated_at();

comment on table public.outbound_webhook_subscriptions is
  'Foundation only. Disabled until admin-configured, allowlisted, signed, and retryable. Signing secrets are not stored here.';

create table public.outbound_webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('OWD-'),
  subscription_id uuid not null references public.outbound_webhook_subscriptions (id) on delete restrict,
  event_type text not null,
  status text not null default 'disabled',
  attempt_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  constraint outbound_delivery_public_id_format check (public_id ~ '^OWD-[A-F0-9]{12}$'),
  constraint outbound_delivery_public_id_key unique (public_id),
  constraint outbound_delivery_status_check
    check (status in ('disabled', 'queued', 'delivered', 'failed'))
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('IMP-'),
  import_type text not null,
  source text not null,
  filename text,
  status text not null default 'uploaded',
  row_count integer not null default 0,
  error_count integer not null default 0,
  review_state text not null default 'needs_review',
  notes text,
  created_by_user_id uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by_user_id uuid references auth.users (id) on delete restrict,
  applied_at timestamptz,
  constraint import_batches_public_id_format check (public_id ~ '^IMP-[A-F0-9]{12}$'),
  constraint import_batches_public_id_key unique (public_id),
  constraint import_batches_type_check check (import_type in (
    'csv_generic', 'csv_contacts', 'excel_placeholder', 'bank_statement', 'provider_transactions'
  )),
  constraint import_batches_source_check check (source in ('upload', 'manual')),
  constraint import_batches_status_check check (status in (
    'uploaded', 'parsed', 'validated', 'preview', 'awaiting_approval', 'approved', 'applied', 'rejected', 'failed', 'cancelled'
  )),
  constraint import_batches_review_check check (review_state in (
    'needs_review', 'approved_preview', 'rejected', 'applied_non_financial'
  )),
  constraint import_batches_row_count_check check (row_count >= 0 and row_count <= 500),
  constraint import_batches_no_auto_finance check (
    applied_at is null
    or import_type not in ('bank_statement', 'provider_transactions')
  )
);

create trigger import_batches_set_updated_at
  before update on public.import_batches
  for each row
  execute function public.set_updated_at();

create index import_batches_created_at_idx on public.import_batches (created_at desc);

comment on table public.import_batches is
  'Import does not become financial truth. Bank and provider files cannot be applied as sales or payments.';

create table public.import_batch_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.import_batches (id) on delete restrict,
  row_number integer not null,
  raw_values jsonb not null default '{}'::jsonb,
  validation_status text not null default 'pending',
  validation_error text,
  duplicate_of_row integer,
  created_at timestamptz not null default now(),
  constraint import_batch_rows_status_check
    check (validation_status in ('pending', 'valid', 'invalid', 'duplicate')),
  constraint import_batch_rows_batch_row_key unique (batch_id, row_number)
);

create index import_batch_rows_batch_id_idx on public.import_batch_rows (batch_id, row_number);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('INC-'),
  title text not null,
  severity text not null,
  status text not null default 'open',
  affected_module text not null,
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  description text,
  created_by_user_id uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint incidents_public_id_format check (public_id ~ '^INC-[A-F0-9]{12}$'),
  constraint incidents_public_id_key unique (public_id),
  constraint incidents_severity_check check (severity in ('low', 'medium', 'high', 'critical')),
  constraint incidents_status_check check (status in ('open', 'investigating', 'resolved', 'closed')),
  constraint incidents_title_length check (char_length(title) between 1 and 160),
  constraint incidents_description_length check (description is null or char_length(description) between 1 and 4000)
);

create trigger incidents_set_updated_at
  before update on public.incidents
  for each row
  execute function public.set_updated_at();

create index incidents_status_idx on public.incidents (status, started_at desc);

comment on table public.incidents is
  'Internal operational incidents. Not a public status page and not uptime claims.';

create table public.release_records (
  id uuid primary key default gen_random_uuid(),
  public_id text not null default public.random_public_id('REL-'),
  version_name text not null,
  environment_label text not null,
  status text not null default 'recorded',
  commit_reference text,
  notes text,
  created_at timestamptz not null default now(),
  released_at timestamptz,
  created_by_user_id uuid not null references auth.users (id) on delete restrict,
  constraint release_records_public_id_format check (public_id ~ '^REL-[A-F0-9]{12}$'),
  constraint release_records_public_id_key unique (public_id),
  constraint release_records_environment_check
    check (environment_label in ('development', 'production', 'unknown')),
  constraint release_records_status_check
    check (status in ('recorded', 'planned', 'cancelled')),
  constraint release_records_version_length check (char_length(version_name) between 1 and 80)
);

create index release_records_created_at_idx on public.release_records (created_at desc);

comment on table public.release_records is
  'Lightweight change records. Recording a release does not mean deployment occurred.';
