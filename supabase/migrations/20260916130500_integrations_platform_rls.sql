-- Phase 4 RLS, grants. Admin-only unless a narrow existing customer/developer case.

revoke all on table public.integrations from public, anon, authenticated;
revoke all on table public.usdt_network_settings from public, anon, authenticated;
revoke all on table public.company_settings from public, anon, authenticated;
revoke all on table public.brand_settings from public, anon, authenticated;
revoke all on table public.platform_currencies from public, anon, authenticated;
revoke all on table public.platform_countries from public, anon, authenticated;
revoke all on table public.platform_languages from public, anon, authenticated;
revoke all on table public.feature_flags from public, anon, authenticated;
revoke all on table public.platform_setting_values from public, anon, authenticated;
revoke all on table public.backup_readiness from public, anon, authenticated;
revoke all on table public.legal_document_drafts from public, anon, authenticated;
revoke all on table public.notification_channels from public, anon, authenticated;
revoke all on table public.notification_deliveries from public, anon, authenticated;
revoke all on table public.email_messages from public, anon, authenticated;
revoke all on table public.outbound_webhook_subscriptions from public, anon, authenticated;
revoke all on table public.outbound_webhook_deliveries from public, anon, authenticated;
revoke all on table public.import_batches from public, anon, authenticated;
revoke all on table public.import_batch_rows from public, anon, authenticated;
revoke all on table public.incidents from public, anon, authenticated;
revoke all on table public.release_records from public, anon, authenticated;

grant select on table public.integrations to authenticated;
grant select on table public.usdt_network_settings to authenticated;
grant select on table public.company_settings to authenticated;
grant select on table public.brand_settings to authenticated;
grant select on table public.platform_currencies to authenticated;
grant select on table public.platform_countries to authenticated;
grant select on table public.platform_languages to authenticated;
grant select on table public.feature_flags to authenticated;
grant select on table public.platform_setting_values to authenticated;
grant select on table public.backup_readiness to authenticated;
grant select on table public.legal_document_drafts to authenticated;
grant select on table public.notification_channels to authenticated;
grant select on table public.notification_deliveries to authenticated;
grant select on table public.email_messages to authenticated;
grant select on table public.outbound_webhook_subscriptions to authenticated;
grant select on table public.outbound_webhook_deliveries to authenticated;
grant select on table public.import_batches to authenticated;
grant select on table public.import_batch_rows to authenticated;
grant select on table public.incidents to authenticated;
grant select on table public.release_records to authenticated;

alter table public.integrations enable row level security;
alter table public.integrations force row level security;
alter table public.usdt_network_settings enable row level security;
alter table public.usdt_network_settings force row level security;
alter table public.company_settings enable row level security;
alter table public.company_settings force row level security;
alter table public.brand_settings enable row level security;
alter table public.brand_settings force row level security;
alter table public.platform_currencies enable row level security;
alter table public.platform_currencies force row level security;
alter table public.platform_countries enable row level security;
alter table public.platform_countries force row level security;
alter table public.platform_languages enable row level security;
alter table public.platform_languages force row level security;
alter table public.feature_flags enable row level security;
alter table public.feature_flags force row level security;
alter table public.platform_setting_values enable row level security;
alter table public.platform_setting_values force row level security;
alter table public.backup_readiness enable row level security;
alter table public.backup_readiness force row level security;
alter table public.legal_document_drafts enable row level security;
alter table public.legal_document_drafts force row level security;
alter table public.notification_channels enable row level security;
alter table public.notification_channels force row level security;
alter table public.notification_deliveries enable row level security;
alter table public.notification_deliveries force row level security;
alter table public.email_messages enable row level security;
alter table public.email_messages force row level security;
alter table public.outbound_webhook_subscriptions enable row level security;
alter table public.outbound_webhook_subscriptions force row level security;
alter table public.outbound_webhook_deliveries enable row level security;
alter table public.outbound_webhook_deliveries force row level security;
alter table public.import_batches enable row level security;
alter table public.import_batches force row level security;
alter table public.import_batch_rows enable row level security;
alter table public.import_batch_rows force row level security;
alter table public.incidents enable row level security;
alter table public.incidents force row level security;
alter table public.release_records enable row level security;
alter table public.release_records force row level security;

create policy integrations_select_admin
  on public.integrations for select to authenticated
  using (public.is_platform_admin());
create policy usdt_network_settings_select_admin
  on public.usdt_network_settings for select to authenticated
  using (public.is_platform_admin());
create policy company_settings_select_admin
  on public.company_settings for select to authenticated
  using (public.is_platform_admin());
create policy brand_settings_select_admin
  on public.brand_settings for select to authenticated
  using (public.is_platform_admin());
create policy platform_currencies_select_admin
  on public.platform_currencies for select to authenticated
  using (public.is_platform_admin());
create policy platform_countries_select_admin
  on public.platform_countries for select to authenticated
  using (public.is_platform_admin());
create policy platform_languages_select_admin
  on public.platform_languages for select to authenticated
  using (public.is_platform_admin());
create policy feature_flags_select_admin
  on public.feature_flags for select to authenticated
  using (public.is_platform_admin());
create policy platform_setting_values_select_admin
  on public.platform_setting_values for select to authenticated
  using (public.is_platform_admin());
create policy backup_readiness_select_admin
  on public.backup_readiness for select to authenticated
  using (public.is_platform_admin());
create policy legal_document_drafts_select_admin
  on public.legal_document_drafts for select to authenticated
  using (public.is_platform_admin());
create policy notification_channels_select_admin
  on public.notification_channels for select to authenticated
  using (public.is_platform_admin());
create policy notification_deliveries_select_admin
  on public.notification_deliveries for select to authenticated
  using (public.is_platform_admin());
create policy email_messages_select_admin
  on public.email_messages for select to authenticated
  using (public.is_platform_admin());
create policy outbound_webhook_subscriptions_select_admin
  on public.outbound_webhook_subscriptions for select to authenticated
  using (public.is_platform_admin());
create policy outbound_webhook_deliveries_select_admin
  on public.outbound_webhook_deliveries for select to authenticated
  using (public.is_platform_admin());
create policy import_batches_select_admin
  on public.import_batches for select to authenticated
  using (public.is_platform_admin());
create policy import_batch_rows_select_admin
  on public.import_batch_rows for select to authenticated
  using (public.is_platform_admin());
create policy incidents_select_admin
  on public.incidents for select to authenticated
  using (public.is_platform_admin());
create policy release_records_select_admin
  on public.release_records for select to authenticated
  using (public.is_platform_admin());
