import { requirePlatformAdmin } from "@/lib/server/auth";
import { listExpenses } from "@/lib/server/operations";
import { parseListPage } from "@/lib/server/pagination";
import { OPERATIONS_PATHS, EXPENSE_STATUS_LABELS } from "@/modules/operations";
import { formatMinor, asMinor } from "@/modules/invoices/money";
import { OpsList } from "../ops-list";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requirePlatformAdmin(OPERATIONS_PATHS.expenses);
  const page = parseListPage((await searchParams).page);
  const rows = await listExpenses(page);
  return (
    <OpsList
      eyebrow="Finance"
      title="Expenses"
      description="Operational expenses. Separate from customer invoices. Recorded is not paid."
      createHref={OPERATIONS_PATHS.expenseNew}
      createLabel="New expense"
      emptyTitle="No expenses"
      emptyDescription="Record an expense when Flash One has a genuine operational cost."
      page={page}
      items={rows.map((row) => ({
        href: OPERATIONS_PATHS.expense(row.public_id),
        publicId: row.public_id,
        title: row.description,
        status: row.status,
        statusLabel: EXPENSE_STATUS_LABELS[row.status as keyof typeof EXPENSE_STATUS_LABELS] ?? row.status,
        meta: `${formatMinor(asMinor(row.amount_minor), row.currency)} · ${row.expense_date}`,
      }))}
    />
  );
}
