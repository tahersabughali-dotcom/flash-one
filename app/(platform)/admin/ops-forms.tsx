"use client";

import { useActionState } from "react";
import { INVOICE_CURRENCIES } from "@/modules/invoices";
import { formatMinor } from "@/modules/invoices/money";
import {
  BENEFICIARY_KINDS,
  BENEFICIARY_KIND_LABELS,
  CASE_STATUSES,
  CASE_STATUS_LABELS,
  CASE_TYPES,
  CASE_TYPE_LABELS,
  COMMISSION_BENEFICIARIES,
  COMMISSION_CALCULATIONS,
  COMMISSION_CALCULATION_LABELS,
  COMMISSION_STATUSES,
  COMMISSION_STATUS_LABELS,
  COMMUNICATION_CHANNELS,
  COMMUNICATION_CHANNEL_LABELS,
  CONTACT_OWNER_KINDS,
  CONTACT_OWNER_LABELS,
  CONTACT_STATUSES,
  CONTACT_STATUS_LABELS,
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_STATUSES,
  EXPENSE_STATUS_LABELS,
  NETWORK_STATUSES,
  NETWORK_STATUS_LABELS,
  NOTE_ENTITY_KINDS,
  PARTNER_TYPES,
  PARTNER_TYPE_LABELS,
  PAYOUT_STATUSES,
  PAYOUT_STATUS_LABELS,
  PERSON_STATUSES,
  PERSON_STATUS_LABELS,
  PROCUREMENT_STATUSES,
  PROCUREMENT_STATUS_LABELS,
  REFERRAL_SOURCES,
  REFERRAL_SOURCE_LABELS,
  SUPPLIER_TYPES,
  SUPPLIER_TYPE_LABELS,
} from "@/modules/operations";
import { TASK_PRIORITIES, TASK_PRIORITY_LABELS, TASK_STATUSES, TASK_STATUS_LABELS } from "@/modules/tasks";
import {
  adminCreateReferralAction,
  adminRecordCommunicationAction,
  adminUploadDocumentAction,
  adminUpsertCommissionAction,
  adminUpsertContactAction,
  adminUpsertEmployeeAction,
  adminUpsertExpenseAction,
  adminUpsertFreelancerAction,
  adminUpsertOperationalTaskAction,
  adminUpsertPartnerAction,
  adminUpsertPayoutAction,
  adminUpsertProcurementAction,
  adminUpsertSupplierAction,
  adminUpsertSupportCaseAction,
  type AdminOpsFormState,
} from "./operations-actions";

const initial: AdminOpsFormState = { error: null };

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-navy-deep">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass = "w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px]";

function Submit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-(--radius-button) bg-blue px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function ErrorText({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p className="text-sm font-medium text-red-700" role="alert">
      {error}
    </p>
  );
}

function majorDefault(amountMinor: number | string | null | undefined, currency: string) {
  if (amountMinor === null || amountMinor === undefined) return "";
  const formatted = formatMinor(Number(amountMinor), currency);
  return formatted.replace(/[^\d.]/g, "");
}

export function EmployeeForm({
  record,
  linkedPublicId,
}: {
  record?: {
    public_id: string;
    display_name: string;
    email: string | null;
    job_title: string | null;
    department: string | null;
    status: string;
    start_date: string | null;
    internal_notes: string | null;
  };
  linkedPublicId?: string;
}) {
  const [state, action, pending] = useActionState(adminUpsertEmployeeAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      {record ? <input type="hidden" name="publicId" value={record.public_id} /> : null}
      <Field label="Name">
        <input name="displayName" required defaultValue={record?.display_name ?? ""} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Email">
          <input name="email" type="email" defaultValue={record?.email ?? ""} className={inputClass} />
        </Field>
        <Field label="Job title">
          <input name="jobTitle" defaultValue={record?.job_title ?? ""} className={inputClass} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Department / team">
          <input name="department" defaultValue={record?.department ?? ""} className={inputClass} />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={record?.status ?? "active"} className={inputClass}>
            {PERSON_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PERSON_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Start date">
        <input name="startDate" type="date" defaultValue={record?.start_date ?? ""} className={inputClass} />
      </Field>
      <Field label="Optional linked platform user (CUS or DEV public ID)">
        <input name="linkedPublicId" defaultValue={linkedPublicId ?? ""} className={inputClass} />
      </Field>
      <p className="text-sm text-muted">An employee record does not grant platform admin.</p>
      <Field label="Internal notes">
        <textarea name="internalNotes" rows={3} defaultValue={record?.internal_notes ?? ""} className={inputClass} />
      </Field>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Save employee" />
    </form>
  );
}

export function FreelancerForm({
  record,
}: {
  record?: {
    public_id: string;
    display_name: string;
    email: string | null;
    specialty: string | null;
    country: string | null;
    status: string;
    internal_notes: string | null;
  };
}) {
  const [state, action, pending] = useActionState(adminUpsertFreelancerAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      {record ? <input type="hidden" name="publicId" value={record.public_id} /> : null}
      <Field label="Name">
        <input name="displayName" required defaultValue={record?.display_name ?? ""} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Email">
          <input name="email" type="email" defaultValue={record?.email ?? ""} className={inputClass} />
        </Field>
        <Field label="Specialty">
          <input name="specialty" defaultValue={record?.specialty ?? ""} className={inputClass} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Country">
          <input name="country" defaultValue={record?.country ?? ""} className={inputClass} />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={record?.status ?? "active"} className={inputClass}>
            {NETWORK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {NETWORK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Optional linked developer public ID">
        <input name="developerPublicId" className={inputClass} />
      </Field>
      <Field label="Internal notes">
        <textarea name="internalNotes" rows={3} defaultValue={record?.internal_notes ?? ""} className={inputClass} />
      </Field>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Save freelancer" />
    </form>
  );
}

export function PartnerForm({
  record,
}: {
  record?: {
    public_id: string;
    name: string;
    relationship_type: string;
    capabilities: string | null;
    website: string | null;
    country: string | null;
    status: string;
    internal_notes: string | null;
  };
}) {
  const [state, action, pending] = useActionState(adminUpsertPartnerAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      {record ? <input type="hidden" name="publicId" value={record.public_id} /> : null}
      <Field label="Company name">
        <input name="name" required defaultValue={record?.name ?? ""} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Relationship type">
          <select name="relationshipType" defaultValue={record?.relationship_type ?? "other"} className={inputClass}>
            {PARTNER_TYPES.map((type) => (
              <option key={type} value={type}>
                {PARTNER_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={record?.status ?? "active"} className={inputClass}>
            {NETWORK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {NETWORK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Services / capabilities">
        <textarea name="capabilities" rows={3} defaultValue={record?.capabilities ?? ""} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Website">
          <input name="website" defaultValue={record?.website ?? ""} className={inputClass} />
        </Field>
        <Field label="Country">
          <input name="country" defaultValue={record?.country ?? ""} className={inputClass} />
        </Field>
      </div>
      <p className="text-sm text-muted">Internal classification only. This is not a public partnership claim.</p>
      <Field label="Internal notes">
        <textarea name="internalNotes" rows={3} defaultValue={record?.internal_notes ?? ""} className={inputClass} />
      </Field>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Save partner" />
    </form>
  );
}

export function SupplierForm({
  record,
}: {
  record?: {
    public_id: string;
    name: string;
    supplier_type: string;
    status: string;
    internal_notes: string | null;
  };
}) {
  const [state, action, pending] = useActionState(adminUpsertSupplierAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      {record ? <input type="hidden" name="publicId" value={record.public_id} /> : null}
      <Field label="Name">
        <input name="name" required defaultValue={record?.name ?? ""} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Type">
          <select name="supplierType" defaultValue={record?.supplier_type ?? "other"} className={inputClass}>
            {SUPPLIER_TYPES.map((type) => (
              <option key={type} value={type}>
                {SUPPLIER_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={record?.status ?? "active"} className={inputClass}>
            {NETWORK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {NETWORK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Internal notes">
        <textarea name="internalNotes" rows={3} defaultValue={record?.internal_notes ?? ""} className={inputClass} />
      </Field>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Save supplier" />
    </form>
  );
}

export function ContactForm({
  record,
}: {
  record?: {
    public_id: string;
    display_name: string;
    job_title: string | null;
    email: string | null;
    phone: string | null;
    owner_kind: string;
    status: string;
    internal_notes: string | null;
  };
}) {
  const [state, action, pending] = useActionState(adminUpsertContactAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      {record ? <input type="hidden" name="publicId" value={record.public_id} /> : null}
      <Field label="Name">
        <input name="displayName" required defaultValue={record?.display_name ?? ""} className={inputClass} />
      </Field>
      <Field label="Role / title">
        <input name="jobTitle" defaultValue={record?.job_title ?? ""} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Email">
          <input name="email" type="email" defaultValue={record?.email ?? ""} className={inputClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" defaultValue={record?.phone ?? ""} className={inputClass} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Relationship">
          <select name="ownerKind" defaultValue={record?.owner_kind ?? "other"} className={inputClass}>
            {CONTACT_OWNER_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {CONTACT_OWNER_LABELS[kind]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Related public ID">
          <input name="ownerPublicId" placeholder="ORG, PAR, or SUP public ID" className={inputClass} />
        </Field>
      </div>
      <Field label="Status">
        <select name="status" defaultValue={record?.status ?? "active"} className={inputClass}>
          {CONTACT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {CONTACT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Internal notes">
        <textarea name="internalNotes" rows={3} defaultValue={record?.internal_notes ?? ""} className={inputClass} />
      </Field>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Save contact" />
    </form>
  );
}

export function ProcurementForm({
  record,
  suppliers,
}: {
  record?: {
    public_id: string;
    description: string;
    currency: string;
    amount_minor: number | string;
    status: string;
    purchase_date: string | null;
    due_date: string | null;
    internal_notes: string | null;
  };
  suppliers: Array<{ public_id: string; name: string }>;
}) {
  const [state, action, pending] = useActionState(adminUpsertProcurementAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      {record ? <input type="hidden" name="publicId" value={record.public_id} /> : null}
      <Field label="Supplier">
        <select name="supplierPublicId" required className={inputClass}>
          <option value="">Select supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.public_id} value={supplier.public_id}>
              {supplier.name} · {supplier.public_id}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Description">
        <input name="description" required defaultValue={record?.description ?? ""} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Currency">
          <select name="currency" defaultValue={record?.currency ?? "GBP"} className={inputClass}>
            {INVOICE_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount">
          <input
            name="amount"
            required
            defaultValue={record ? majorDefault(record.amount_minor, record.currency) : ""}
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={record?.status ?? "draft"} className={inputClass}>
            {PROCUREMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PROCUREMENT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Purchase date">
          <input name="purchaseDate" type="date" defaultValue={record?.purchase_date ?? ""} className={inputClass} />
        </Field>
        <Field label="Due date">
          <input name="dueDate" type="date" defaultValue={record?.due_date ?? ""} className={inputClass} />
        </Field>
      </div>
      <Field label="Related project public ID">
        <input name="projectPublicId" className={inputClass} />
      </Field>
      <p className="text-sm text-muted">A purchase is not customer revenue and is not automatically paid.</p>
      <Field label="Internal notes">
        <textarea name="internalNotes" rows={3} defaultValue={record?.internal_notes ?? ""} className={inputClass} />
      </Field>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Save purchase" />
    </form>
  );
}

export function ExpenseForm({
  record,
  options,
}: {
  record?: {
    public_id: string;
    category: string;
    description: string;
    currency: string;
    amount_minor: number | string;
    expense_date: string;
    status: string;
    internal_notes: string | null;
  };
  options: {
    suppliers: Array<{ public_id: string; name: string }>;
    employees: Array<{ public_id: string; display_name: string }>;
    freelancers: Array<{ public_id: string; display_name: string }>;
    partners: Array<{ public_id: string; name: string }>;
    documents: Array<{ public_id: string; title: string }>;
  };
}) {
  const [state, action, pending] = useActionState(adminUpsertExpenseAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      {record ? <input type="hidden" name="publicId" value={record.public_id} /> : null}
      <Field label="Description">
        <input name="description" required defaultValue={record?.description ?? ""} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Category">
          <select name="category" defaultValue={record?.category ?? "operations"} className={inputClass}>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {EXPENSE_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={record?.status ?? "draft"} className={inputClass}>
            {EXPENSE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {EXPENSE_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Currency">
          <select name="currency" defaultValue={record?.currency ?? "GBP"} className={inputClass}>
            {INVOICE_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount">
          <input
            name="amount"
            required
            defaultValue={record ? majorDefault(record.amount_minor, record.currency) : ""}
            className={inputClass}
          />
        </Field>
        <Field label="Date">
          <input name="expenseDate" type="date" required defaultValue={record?.expense_date ?? ""} className={inputClass} />
        </Field>
      </div>
      <p className="text-sm text-muted">Recorded means the expense is recognized. It is not a completed payment.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Supplier">
          <select name="supplierPublicId" className={inputClass}>
            <option value="">None</option>
            {options.suppliers.map((item) => (
              <option key={item.public_id} value={item.public_id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Employee">
          <select name="employeePublicId" className={inputClass}>
            <option value="">None</option>
            {options.employees.map((item) => (
              <option key={item.public_id} value={item.public_id}>
                {item.display_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Freelancer">
          <select name="freelancerPublicId" className={inputClass}>
            <option value="">None</option>
            {options.freelancers.map((item) => (
              <option key={item.public_id} value={item.public_id}>
                {item.display_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Partner">
          <select name="partnerPublicId" className={inputClass}>
            <option value="">None</option>
            {options.partners.map((item) => (
              <option key={item.public_id} value={item.public_id}>
                {item.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Related project public ID">
        <input name="projectPublicId" className={inputClass} />
      </Field>
      <Field label="Document Center reference">
        <select name="documentPublicId" className={inputClass}>
          <option value="">None</option>
          {options.documents.map((item) => (
            <option key={item.public_id} value={item.public_id}>
              {item.title} · {item.public_id}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Internal notes">
        <textarea name="internalNotes" rows={3} defaultValue={record?.internal_notes ?? ""} className={inputClass} />
      </Field>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Save expense" />
    </form>
  );
}

export function PayoutForm({
  record,
  options,
}: {
  record?: {
    public_id: string;
    beneficiary_kind: string;
    amount_minor: number | string;
    currency: string;
    reason: string;
    status: string;
    due_date: string | null;
    paid_at: string | null;
    payment_method_description: string | null;
    reference_text: string | null;
    internal_notes: string | null;
  };
  options: {
    employees: Array<{ public_id: string; display_name: string }>;
    freelancers: Array<{ public_id: string; display_name: string }>;
    suppliers: Array<{ public_id: string; name: string }>;
    partners: Array<{ public_id: string; name: string }>;
  };
}) {
  const [state, action, pending] = useActionState(adminUpsertPayoutAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      {record ? <input type="hidden" name="publicId" value={record.public_id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Beneficiary type">
          <select name="beneficiaryKind" defaultValue={record?.beneficiary_kind ?? "freelancer"} className={inputClass}>
            {BENEFICIARY_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {BENEFICIARY_KIND_LABELS[kind]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Beneficiary public ID">
          <input name="beneficiaryPublicId" required list="payout-beneficiaries" className={inputClass} />
          <datalist id="payout-beneficiaries">
            {options.employees.map((item) => (
              <option key={item.public_id} value={item.public_id} label={item.display_name} />
            ))}
            {options.freelancers.map((item) => (
              <option key={item.public_id} value={item.public_id} label={item.display_name} />
            ))}
            {options.suppliers.map((item) => (
              <option key={item.public_id} value={item.public_id} label={item.name} />
            ))}
            {options.partners.map((item) => (
              <option key={item.public_id} value={item.public_id} label={item.name} />
            ))}
          </datalist>
        </Field>
      </div>
      <Field label="Reason">
        <input name="reason" required defaultValue={record?.reason ?? ""} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Currency">
          <select name="currency" defaultValue={record?.currency ?? "GBP"} className={inputClass}>
            {INVOICE_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount">
          <input
            name="amount"
            required
            defaultValue={record ? majorDefault(record.amount_minor, record.currency) : ""}
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={record?.status ?? "draft"} className={inputClass}>
            {PAYOUT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PAYOUT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Due date">
          <input name="dueDate" type="date" defaultValue={record?.due_date ?? ""} className={inputClass} />
        </Field>
        <Field label="Paid at">
          <input
            name="paidAt"
            type="datetime-local"
            defaultValue={record?.paid_at ? record.paid_at.slice(0, 16) : ""}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Payment method / source (only if truthfully recorded)">
        <input
          name="paymentMethodDescription"
          defaultValue={record?.payment_method_description ?? ""}
          placeholder="Manual bank transfer, cash, etc."
          className={inputClass}
        />
      </Field>
      <Field label="Reference">
        <input name="referenceText" defaultValue={record?.reference_text ?? ""} className={inputClass} />
      </Field>
      <Field label="Related project public ID">
        <input name="projectPublicId" className={inputClass} />
      </Field>
      <Field label="Related expense public ID">
        <input name="expensePublicId" className={inputClass} />
      </Field>
      <p className="text-sm text-muted">
        Do not mark paid unless a truthful method and date are recorded. This is not a provider transfer.
      </p>
      <Field label="Internal notes">
        <textarea name="internalNotes" rows={3} defaultValue={record?.internal_notes ?? ""} className={inputClass} />
      </Field>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Save payout" />
    </form>
  );
}

export function ReferralForm() {
  const [state, action, pending] = useActionState(adminCreateReferralAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      <Field label="Source type">
        <select name="sourceKind" defaultValue="other" className={inputClass}>
          {REFERRAL_SOURCES.map((kind) => (
            <option key={kind} value={kind}>
              {REFERRAL_SOURCE_LABELS[kind]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Source public ID">
        <input name="sourcePublicId" className={inputClass} />
      </Field>
      <Field label="Source label">
        <input name="sourceLabel" className={inputClass} />
      </Field>
      <Field label="Customer public ID">
        <input name="customerPublicId" className={inputClass} />
      </Field>
      <Field label="Organization public ID">
        <input name="organizationPublicId" className={inputClass} />
      </Field>
      <Field label="Project public ID">
        <input name="projectPublicId" className={inputClass} />
      </Field>
      <p className="text-sm text-muted">A referral does not automatically create commission.</p>
      <Field label="Internal notes">
        <textarea name="internalNotes" rows={3} className={inputClass} />
      </Field>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Save referral" />
    </form>
  );
}

export function CommissionForm({ record }: { record?: { public_id: string; reason: string; currency: string; status: string } }) {
  const [state, action, pending] = useActionState(adminUpsertCommissionAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      {record ? <input type="hidden" name="publicId" value={record.public_id} /> : null}
      <Field label="Beneficiary type">
        <select name="beneficiaryKind" defaultValue="freelancer" className={inputClass}>
          {COMMISSION_BENEFICIARIES.map((kind) => (
            <option key={kind} value={kind}>
              {BENEFICIARY_KIND_LABELS[kind]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Beneficiary public ID">
        <input name="beneficiaryPublicId" required className={inputClass} />
      </Field>
      <Field label="Calculation">
        <select name="calculationType" defaultValue="fixed" className={inputClass}>
          {COMMISSION_CALCULATIONS.map((type) => (
            <option key={type} value={type}>
              {COMMISSION_CALCULATION_LABELS[type]}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Fixed amount">
          <input name="amount" className={inputClass} />
        </Field>
        <Field label="Currency">
          <select name="currency" defaultValue={record?.currency ?? "GBP"} className={inputClass}>
            {INVOICE_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Percentage basis amount">
          <input name="basisAmount" className={inputClass} />
        </Field>
        <Field label="Rate (basis points)">
          <input name="rateBps" placeholder="250 = 2.50%" className={inputClass} />
        </Field>
      </div>
      <Field label="Status">
        <select name="status" defaultValue={record?.status ?? "draft"} className={inputClass}>
          {COMMISSION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {COMMISSION_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Reason">
        <input name="reason" required defaultValue={record?.reason ?? ""} className={inputClass} />
      </Field>
      <Field label="Referral public ID">
        <input name="referralPublicId" className={inputClass} />
      </Field>
      <Field label="Project public ID">
        <input name="projectPublicId" className={inputClass} />
      </Field>
      <Field label="Invoice public ID">
        <input name="invoicePublicId" className={inputClass} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-semibold text-navy-deep">
        <input type="checkbox" name="createPayout" />
        Create an approved payout when this commission is approved
      </label>
      <p className="text-sm text-muted">Commission is explicit. It is not profit and is not calculated from gross payments automatically.</p>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Save commission" />
    </form>
  );
}

export function OperationalTaskForm({
  record,
  employees,
}: {
  record?: {
    public_id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    due_at: string | null;
  };
  employees: Array<{ public_id: string; display_name: string }>;
}) {
  const [state, action, pending] = useActionState(adminUpsertOperationalTaskAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      {record ? <input type="hidden" name="publicId" value={record.public_id} /> : null}
      <Field label="Title">
        <input name="title" required defaultValue={record?.title ?? ""} className={inputClass} />
      </Field>
      <Field label="Description">
        <textarea name="description" rows={3} defaultValue={record?.description ?? ""} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Status">
          <select name="status" defaultValue={record?.status ?? "todo"} className={inputClass}>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select name="priority" defaultValue={record?.priority ?? "normal"} className={inputClass}>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {TASK_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Due date">
          <input
            name="dueAt"
            type="date"
            defaultValue={record?.due_at ? record.due_at.slice(0, 10) : ""}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Assignee (employee)">
        <select name="assigneeEmployeePublicId" className={inputClass}>
          <option value="">Unassigned</option>
          {employees.map((item) => (
            <option key={item.public_id} value={item.public_id}>
              {item.display_name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Related project public ID">
        <input name="projectPublicId" className={inputClass} />
      </Field>
      <Field label="Related customer public ID">
        <input name="customerPublicId" className={inputClass} />
      </Field>
      <Field label="Related invoice public ID">
        <input name="invoicePublicId" className={inputClass} />
      </Field>
      <Field label="Related case public ID">
        <input name="casePublicId" className={inputClass} />
      </Field>
      <p className="text-sm text-muted">Internal tasks are never customer-visible.</p>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Save task" />
    </form>
  );
}

export function SupportCaseForm({
  record,
  employees,
}: {
  record?: {
    public_id: string;
    title: string;
    case_type: string;
    priority: string;
    status: string;
    description: string | null;
    customer_visible: boolean;
  };
  employees: Array<{ public_id: string; display_name: string }>;
}) {
  const [state, action, pending] = useActionState(adminUpsertSupportCaseAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      {record ? <input type="hidden" name="publicId" value={record.public_id} /> : null}
      <Field label="Title">
        <input name="title" required defaultValue={record?.title ?? ""} className={inputClass} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Type">
          <select name="caseType" defaultValue={record?.case_type ?? "general"} className={inputClass}>
            {CASE_TYPES.map((type) => (
              <option key={type} value={type}>
                {CASE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select name="priority" defaultValue={record?.priority ?? "normal"} className={inputClass}>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {TASK_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={record?.status ?? "open"} className={inputClass}>
            {CASE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {CASE_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Description">
        <textarea name="description" rows={4} defaultValue={record?.description ?? ""} className={inputClass} />
      </Field>
      <Field label="Assigned employee">
        <select name="assignedEmployeePublicId" className={inputClass}>
          <option value="">Unassigned</option>
          {employees.map((item) => (
            <option key={item.public_id} value={item.public_id}>
              {item.display_name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Customer public ID">
        <input name="customerPublicId" className={inputClass} />
      </Field>
      <Field label="Organization public ID">
        <input name="organizationPublicId" className={inputClass} />
      </Field>
      <Field label="Project public ID">
        <input name="projectPublicId" className={inputClass} />
      </Field>
      <Field label="Order public ID">
        <input name="orderPublicId" className={inputClass} />
      </Field>
      <Field label="Invoice public ID">
        <input name="invoicePublicId" className={inputClass} />
      </Field>
      <label className="flex items-center gap-2 text-sm font-semibold text-navy-deep">
        <input type="checkbox" name="customerVisible" defaultChecked={record?.customer_visible} />
        Visible in the customer portal
      </label>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Save case" />
    </form>
  );
}

export function CommunicationForm() {
  const [state, action, pending] = useActionState(adminRecordCommunicationAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      <Field label="Channel">
        <select name="channel" defaultValue="email" className={inputClass}>
          {COMMUNICATION_CHANNELS.map((channel) => (
            <option key={channel} value={channel}>
              {COMMUNICATION_CHANNEL_LABELS[channel]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Title">
        <input name="title" required className={inputClass} />
      </Field>
      <Field label="Notes">
        <textarea name="body" rows={4} className={inputClass} />
      </Field>
      <Field label="Occurred at">
        <input name="occurredAt" type="datetime-local" required className={inputClass} />
      </Field>
      <Field label="Related entity kind">
        <select name="entityKind" className={inputClass}>
          <option value="">None</option>
          {NOTE_ENTITY_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Related public ID">
        <input name="entityPublicId" className={inputClass} />
      </Field>
      <Field label="Customer public ID">
        <input name="customerPublicId" className={inputClass} />
      </Field>
      <Field label="Organization public ID">
        <input name="organizationPublicId" className={inputClass} />
      </Field>
      <Field label="Project public ID">
        <input name="projectPublicId" className={inputClass} />
      </Field>
      <p className="text-sm text-muted">
        External channels are saved as manual records. This does not send email, WhatsApp, SMS, or meeting invites.
      </p>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Record communication" />
    </form>
  );
}

export function DocumentUploadForm() {
  const [state, action, pending] = useActionState(adminUploadDocumentAction, initial);
  return (
    <form action={action} className="mt-6 space-y-5">
      <Field label="Title">
        <input name="title" required className={inputClass} />
      </Field>
      <Field label="Document type">
        <select name="documentType" defaultValue="internal" className={inputClass}>
          {DOCUMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {DOCUMENT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Related entity kind">
        <select name="entityKind" defaultValue="other" className={inputClass}>
          {NOTE_ENTITY_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Related public ID">
        <input name="entityPublicId" className={inputClass} />
      </Field>
      <Field label="File">
        <input name="file" type="file" required className="block w-full text-sm" />
      </Field>
      <Field label="Internal notes">
        <textarea name="internalNotes" rows={3} className={inputClass} />
      </Field>
      <p className="text-sm text-muted">Private storage. Access is signed after authorization. This is not a project delivery file.</p>
      <ErrorText error={state.error} />
      <Submit pending={pending} label="Upload document" />
    </form>
  );
}
