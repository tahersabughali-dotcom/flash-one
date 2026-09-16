-- Phase 3 remaining RPCs, storage, and RLS.

create or replace function public.admin_upsert_procurement(
  p_public_id text,
  p_supplier_public_id text,
  p_description text,
  p_currency text,
  p_amount_minor bigint,
  p_status text,
  p_purchase_date date,
  p_due_date date,
  p_project_public_id text,
  p_internal_notes text
)
returns public.procurement_purchases
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.procurement_purchases;
  supplier uuid;
  project uuid;
begin
  actor := public.assert_platform_admin();
  select id into supplier from public.suppliers where public_id = p_supplier_public_id;
  if supplier is null then raise exception 'supplier not found'; end if;
  project := null;
  if p_project_public_id is not null and btrim(p_project_public_id) <> '' then
    select id into project from public.projects where public_id = p_project_public_id;
    if project is null then raise exception 'project not found'; end if;
  end if;
  if p_public_id is null or btrim(p_public_id) = '' then
    insert into public.procurement_purchases (
      supplier_id, description, currency, amount_minor, status, purchase_date, due_date, project_id, internal_notes, created_by_user_id
    ) values (
      supplier, left(trim(p_description), 400), p_currency, p_amount_minor,
      coalesce(nullif(p_status, ''), 'draft'), p_purchase_date, p_due_date, project,
      nullif(left(trim(coalesce(p_internal_notes, '')), 4000), ''), actor
    ) returning * into current;
  else
    update public.procurement_purchases
    set
      supplier_id = supplier,
      description = left(trim(p_description), 400),
      currency = p_currency,
      amount_minor = p_amount_minor,
      status = coalesce(nullif(p_status, ''), status),
      purchase_date = p_purchase_date,
      due_date = p_due_date,
      project_id = project,
      internal_notes = nullif(left(trim(coalesce(p_internal_notes, '')), 4000), '')
    where public_id = p_public_id
    returning * into current;
    if current.id is null then raise exception 'purchase not found'; end if;
  end if;
  perform public.admin_record_audit_event('procurement.upsert', 'procurement', current.id, jsonb_build_object('public_id', current.public_id));
  return current;
end;
$$;

revoke all on function public.admin_upsert_procurement(text, text, text, text, bigint, text, date, date, text, text) from public, anon;
grant execute on function public.admin_upsert_procurement(text, text, text, text, bigint, text, date, date, text, text) to authenticated;

create or replace function public.admin_upsert_expense(
  p_public_id text,
  p_category text,
  p_description text,
  p_currency text,
  p_amount_minor bigint,
  p_expense_date date,
  p_status text,
  p_supplier_public_id text,
  p_employee_public_id text,
  p_freelancer_public_id text,
  p_partner_public_id text,
  p_project_public_id text,
  p_document_public_id text,
  p_internal_notes text
)
returns public.expenses
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.expenses;
  previous_status text;
  supplier uuid; employee uuid; freelancer uuid; partner uuid; project uuid; document uuid;
begin
  actor := public.assert_platform_admin();
  select id into supplier from public.suppliers where public_id = nullif(p_supplier_public_id, '');
  select id into employee from public.employees where public_id = nullif(p_employee_public_id, '');
  select id into freelancer from public.freelancers where public_id = nullif(p_freelancer_public_id, '');
  select id into partner from public.partner_companies where public_id = nullif(p_partner_public_id, '');
  select id into project from public.projects where public_id = nullif(p_project_public_id, '');
  select id into document from public.operational_documents where public_id = nullif(p_document_public_id, '');
  if p_public_id is null or btrim(p_public_id) = '' then
    previous_status := null;
    insert into public.expenses (
      category, description, currency, amount_minor, expense_date, status,
      supplier_id, employee_id, freelancer_id, partner_id, project_id, document_id, internal_notes, created_by_user_id
    ) values (
      p_category, left(trim(p_description), 400), p_currency, p_amount_minor, p_expense_date,
      coalesce(nullif(p_status, ''), 'draft'),
      supplier, employee, freelancer, partner, project, document,
      nullif(left(trim(coalesce(p_internal_notes, '')), 4000), ''), actor
    ) returning * into current;
  else
    select status into previous_status from public.expenses where public_id = p_public_id;
    update public.expenses
    set
      category = p_category,
      description = left(trim(p_description), 400),
      currency = p_currency,
      amount_minor = p_amount_minor,
      expense_date = p_expense_date,
      status = coalesce(nullif(p_status, ''), status),
      supplier_id = supplier,
      employee_id = employee,
      freelancer_id = freelancer,
      partner_id = partner,
      project_id = project,
      document_id = document,
      internal_notes = nullif(left(trim(coalesce(p_internal_notes, '')), 4000), '')
    where public_id = p_public_id
    returning * into current;
    if current.id is null then raise exception 'expense not found'; end if;
  end if;
  if current.status = 'recorded' and coalesce(previous_status, '') <> 'recorded' then
    perform public.post_financial_ledger_entry(
      'expense_recorded', current.currency, current.amount_minor, 'out',
      null, null, null, current.public_id
    );
  end if;
  perform public.admin_record_audit_event('expense.upsert', 'expense', current.id, jsonb_build_object('public_id', current.public_id, 'status', current.status));
  return current;
end;
$$;

revoke all on function public.admin_upsert_expense(text, text, text, text, bigint, date, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.admin_upsert_expense(text, text, text, text, bigint, date, text, text, text, text, text, text, text, text) to authenticated;

create or replace function public.admin_upsert_payout(
  p_public_id text,
  p_beneficiary_kind text,
  p_beneficiary_public_id text,
  p_amount_minor bigint,
  p_currency text,
  p_reason text,
  p_status text,
  p_due_date date,
  p_paid_at timestamptz,
  p_payment_method_description text,
  p_reference_text text,
  p_project_public_id text,
  p_expense_public_id text,
  p_internal_notes text
)
returns public.payouts
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.payouts;
  previous_status text;
  employee uuid; freelancer uuid; supplier uuid; partner uuid; project uuid; expense uuid;
  recipient uuid;
begin
  actor := public.assert_platform_admin();
  employee := null; freelancer := null; supplier := null; partner := null;
  if p_beneficiary_kind = 'employee' then
    select id, user_id into employee, recipient from public.employees where public_id = p_beneficiary_public_id;
    if employee is null then raise exception 'employee not found'; end if;
  elsif p_beneficiary_kind = 'freelancer' then
    select id into freelancer from public.freelancers where public_id = p_beneficiary_public_id;
    if freelancer is null then raise exception 'freelancer not found'; end if;
  elsif p_beneficiary_kind = 'supplier' then
    select id into supplier from public.suppliers where public_id = p_beneficiary_public_id;
    if supplier is null then raise exception 'supplier not found'; end if;
  elsif p_beneficiary_kind = 'partner' then
    select id into partner from public.partner_companies where public_id = p_beneficiary_public_id;
    if partner is null then raise exception 'partner not found'; end if;
  else
    raise exception 'invalid beneficiary';
  end if;
  select id into project from public.projects where public_id = nullif(p_project_public_id, '');
  select id into expense from public.expenses where public_id = nullif(p_expense_public_id, '');
  if p_public_id is null or btrim(p_public_id) = '' then
    previous_status := null;
    insert into public.payouts (
      beneficiary_kind, employee_id, freelancer_id, supplier_id, partner_id,
      amount_minor, currency, reason, status, due_date, paid_at, payment_method_description,
      reference_text, project_id, expense_id, internal_notes, created_by_user_id
    ) values (
      p_beneficiary_kind, employee, freelancer, supplier, partner,
      p_amount_minor, p_currency, left(trim(p_reason), 400),
      coalesce(nullif(p_status, ''), 'draft'), p_due_date, p_paid_at,
      nullif(left(trim(coalesce(p_payment_method_description, '')), 160), ''),
      nullif(left(trim(coalesce(p_reference_text, '')), 160), ''),
      project, expense, nullif(left(trim(coalesce(p_internal_notes, '')), 4000), ''), actor
    ) returning * into current;
  else
    select status into previous_status from public.payouts where public_id = p_public_id;
    update public.payouts
    set
      beneficiary_kind = p_beneficiary_kind,
      employee_id = employee,
      freelancer_id = freelancer,
      supplier_id = supplier,
      partner_id = partner,
      amount_minor = p_amount_minor,
      currency = p_currency,
      reason = left(trim(p_reason), 400),
      status = coalesce(nullif(p_status, ''), status),
      due_date = p_due_date,
      paid_at = p_paid_at,
      payment_method_description = nullif(left(trim(coalesce(p_payment_method_description, '')), 160), ''),
      reference_text = nullif(left(trim(coalesce(p_reference_text, '')), 160), ''),
      project_id = project,
      expense_id = expense,
      internal_notes = nullif(left(trim(coalesce(p_internal_notes, '')), 4000), '')
    where public_id = p_public_id
    returning * into current;
    if current.id is null then raise exception 'payout not found'; end if;
  end if;
  if current.status = 'paid_manual' and coalesce(previous_status, '') <> 'paid_manual' then
    perform public.post_financial_ledger_entry(
      'payout_recorded', current.currency, current.amount_minor, 'out',
      null, null, null, current.public_id
    );
  end if;
  if current.status = 'approved' and coalesce(previous_status, '') <> 'approved' and recipient is not null then
    perform public.internal_create_notification(
      recipient, 'payout_approved', 'Payout approved',
      'A payout was approved in Flash One operations.', 'payout', current.public_id
    );
  end if;
  perform public.admin_record_audit_event('payout.upsert', 'payout', current.id, jsonb_build_object('public_id', current.public_id, 'status', current.status));
  return current;
end;
$$;

revoke all on function public.admin_upsert_payout(text, text, text, bigint, text, text, text, date, timestamptz, text, text, text, text, text) from public, anon;
grant execute on function public.admin_upsert_payout(text, text, text, bigint, text, text, text, date, timestamptz, text, text, text, text, text) to authenticated;

create or replace function public.admin_create_referral(
  p_source_kind text,
  p_source_public_id text,
  p_source_label text,
  p_customer_public_id text,
  p_organization_public_id text,
  p_project_public_id text,
  p_internal_notes text
)
returns public.referrals
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.referrals;
  employee uuid; freelancer uuid; partner uuid; customer uuid; org uuid; project uuid;
begin
  actor := public.assert_platform_admin();
  employee := null; freelancer := null; partner := null;
  if p_source_kind = 'employee' then
    select id into employee from public.employees where public_id = p_source_public_id;
    if employee is null then raise exception 'employee not found'; end if;
  elsif p_source_kind = 'freelancer' then
    select id into freelancer from public.freelancers where public_id = p_source_public_id;
    if freelancer is null then raise exception 'freelancer not found'; end if;
  elsif p_source_kind = 'partner' then
    select id into partner from public.partner_companies where public_id = p_source_public_id;
    if partner is null then raise exception 'partner not found'; end if;
  elsif p_source_kind <> 'other' then
    raise exception 'invalid referral source';
  end if;
  select user_id into customer from public.individual_accounts where public_id = nullif(p_customer_public_id, '');
  select id into org from public.organizations where public_id = nullif(p_organization_public_id, '');
  select id into project from public.projects where public_id = nullif(p_project_public_id, '');
  insert into public.referrals (
    source_kind, employee_id, freelancer_id, partner_id, source_label,
    individual_user_id, organization_id, project_id, internal_notes, created_by_user_id
  ) values (
    p_source_kind, employee, freelancer, partner,
    nullif(left(trim(coalesce(p_source_label, '')), 160), ''),
    customer, org, project,
    nullif(left(trim(coalesce(p_internal_notes, '')), 4000), ''), actor
  ) returning * into current;
  return current;
end;
$$;

revoke all on function public.admin_create_referral(text, text, text, text, text, text, text) from public, anon;
grant execute on function public.admin_create_referral(text, text, text, text, text, text, text) to authenticated;

create or replace function public.admin_upsert_commission(
  p_public_id text,
  p_referral_public_id text,
  p_beneficiary_kind text,
  p_beneficiary_public_id text,
  p_calculation_type text,
  p_basis_amount_minor bigint,
  p_rate_bps integer,
  p_amount_minor bigint,
  p_currency text,
  p_status text,
  p_reason text,
  p_project_public_id text,
  p_invoice_public_id text,
  p_create_payout boolean
)
returns public.commissions
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  actor uuid;
  current public.commissions;
  referral uuid;
  employee uuid; freelancer uuid; partner uuid; project uuid; invoice uuid;
  computed bigint;
  payout public.payouts;
begin
  actor := public.assert_platform_admin();
  computed := p_amount_minor;
  if p_calculation_type = 'percentage' then
    if p_basis_amount_minor is null or p_rate_bps is null then
      raise exception 'percentage commission requires basis and rate';
    end if;
    computed := (p_basis_amount_minor * p_rate_bps) / 10000;
    if computed < 1 then raise exception 'commission amount too small'; end if;
  end if;
  employee := null; freelancer := null; partner := null;
  if p_beneficiary_kind = 'employee' then
    select id into employee from public.employees where public_id = p_beneficiary_public_id;
    if employee is null then raise exception 'employee not found'; end if;
  elsif p_beneficiary_kind = 'freelancer' then
    select id into freelancer from public.freelancers where public_id = p_beneficiary_public_id;
    if freelancer is null then raise exception 'freelancer not found'; end if;
  elsif p_beneficiary_kind = 'partner' then
    select id into partner from public.partner_companies where public_id = p_beneficiary_public_id;
    if partner is null then raise exception 'partner not found'; end if;
  else
    raise exception 'invalid beneficiary';
  end if;
  select id into referral from public.referrals where public_id = nullif(p_referral_public_id, '');
  select id into project from public.projects where public_id = nullif(p_project_public_id, '');
  select id into invoice from public.invoices where public_id = nullif(p_invoice_public_id, '');
  if p_public_id is null or btrim(p_public_id) = '' then
    insert into public.commissions (
      referral_id, beneficiary_kind, employee_id, freelancer_id, partner_id,
      calculation_type, basis_amount_minor, rate_bps, amount_minor, currency, status, reason,
      project_id, invoice_id, created_by_user_id
    ) values (
      referral, p_beneficiary_kind, employee, freelancer, partner,
      p_calculation_type, p_basis_amount_minor, p_rate_bps, computed, p_currency,
      coalesce(nullif(p_status, ''), 'draft'), left(trim(p_reason), 400),
      project, invoice, actor
    ) returning * into current;
  else
    update public.commissions
    set
      referral_id = referral,
      beneficiary_kind = p_beneficiary_kind,
      employee_id = employee,
      freelancer_id = freelancer,
      partner_id = partner,
      calculation_type = p_calculation_type,
      basis_amount_minor = p_basis_amount_minor,
      rate_bps = p_rate_bps,
      amount_minor = computed,
      currency = p_currency,
      status = coalesce(nullif(p_status, ''), status),
      reason = left(trim(p_reason), 400),
      project_id = project,
      invoice_id = invoice
    where public_id = p_public_id
    returning * into current;
    if current.id is null then raise exception 'commission not found'; end if;
  end if;
  if coalesce(p_create_payout, false) and current.status = 'approved' and current.payout_id is null then
    insert into public.payouts (
      beneficiary_kind, employee_id, freelancer_id, partner_id, amount_minor, currency, reason, status, created_by_user_id
    ) values (
      current.beneficiary_kind, current.employee_id, current.freelancer_id, current.partner_id,
      current.amount_minor, current.currency, 'Commission ' || current.public_id, 'approved', actor
    ) returning * into payout;
    update public.commissions set payout_id = payout.id where id = current.id returning * into current;
  end if;
  perform public.admin_record_audit_event('commission.upsert', 'commission', current.id, jsonb_build_object('public_id', current.public_id));
  return current;
end;
$$;

revoke all on function public.admin_upsert_commission(text, text, text, text, text, bigint, integer, bigint, text, text, text, text, text, boolean) from public, anon;
grant execute on function public.admin_upsert_commission(text, text, text, text, text, bigint, integer, bigint, text, text, text, text, text, boolean) to authenticated;
