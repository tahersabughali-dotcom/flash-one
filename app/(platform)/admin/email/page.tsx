import { requirePlatformAdmin } from "@/lib/server/auth";
import { listEmailMessages } from "@/lib/server/platform/settings-queries";
import { listEmailTemplateCodes, renderEmailTemplate } from "@/lib/server/email";
import { parseListPage } from "@/lib/server/pagination";
import { INTEGRATION_PATHS } from "@/modules/integrations";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { ListPager } from "@/components/platform/ListPager";
import { transactionalEmailAdapter } from "@/lib/server/integrations/email/adapter";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePlatformAdmin(INTEGRATION_PATHS.email);
  const page = parseListPage((await searchParams).page);
  const rows = await listEmailMessages(page);
  const templates = listEmailTemplateCodes().map((code) => renderEmailTemplate(code));
  const configured = transactionalEmailAdapter.isConfigured();

  return (
    <main>
      <PageHeader
        eyebrow="System"
        title="Email"
        description="Transactional email foundation. Templates render without a provider. Live sending remains unavailable until credentials and launch hardening are complete."
      />
      <SectionPanel title="Provider">
        <p className="text-sm text-muted">
          {configured
            ? "Email environment variables are present (values hidden). Live sending is still not enabled in this phase."
            : "EMAIL_PROVIDER, EMAIL_API_KEY, and EMAIL_FROM_ADDRESS are required before any send."}
        </p>
      </SectionPanel>
      <SectionPanel title="Templates">
        <ul className="space-y-3 text-sm">
          {templates.map((template) => (
            <li key={template.code} className="rounded-2xl border border-line bg-white px-4 py-3">
              <p className="font-semibold text-navy-deep">{template.code}</p>
              <p className="mt-1 text-muted">Subject: {template.subject}</p>
            </li>
          ))}
        </ul>
      </SectionPanel>
      <SectionPanel title="Email records">
        {rows.length === 0 ? (
          <EmptyState
            title="No email records"
            description="Queued transactional email records will appear here. In-app notifications continue normally."
          />
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.public_id}>
                <RecordCard
                  href={INTEGRATION_PATHS.email}
                  reference={row.public_id}
                  title={row.subject}
                  status={row.status}
                  statusLabel={row.status}
                />
                <p className="mt-1 text-sm text-muted">
                  {row.template_code}
                  {row.error_summary ? ` · ${row.error_summary}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
        <ListPager page={page} itemCount={rows.length} />
      </SectionPanel>
    </main>
  );
}
