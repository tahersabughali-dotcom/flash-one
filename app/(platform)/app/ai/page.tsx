import { requireCompletedOnboarding } from "@/lib/server/account";
import { getAiStatus, isDevelopmentAiEnabled, listAiConversations, listAiMessages } from "@/lib/server/ai/core";
import { AI_PATHS } from "@/modules/ai";
import { formatDisplayDateTime } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { EmptyState } from "@/components/platform/EmptyState";
import { AiAssistantForm } from "./assistant-form";

function suggestionFields(value: unknown): Array<{ label: string; text: string }> {
  if (!value || typeof value !== "object") {
    return [];
  }
  const row = value as Record<string, unknown>;
  const fields: Array<[string, unknown]> = [
    ["Title", row.title],
    ["Summary", row.summary],
    ["Details", row.details],
    ["Service", row.service_category],
  ];
  return fields.flatMap(([label, text]) =>
    typeof text === "string" && text.trim() ? [{ label, text }] : [],
  );
}

export default async function AiWorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { summary } = await requireCompletedOnboarding(AI_PATHS.workspace);
  const params = await searchParams;
  const status = await getAiStatus();
  const configured = status.configured && status.code === "development_test" && isDevelopmentAiEnabled();
  const conversations = await listAiConversations();
  const activeId = params.c ?? conversations[0]?.public_id ?? undefined;
  const messages = activeId ? await listAiMessages(activeId) : [];
  const activeConversation = conversations.find((item) => item.public_id === activeId);
  const pendingSuggestion = activeConversation?.pending_suggestion ?? null;
  const suggestion = suggestionFields(pendingSuggestion);

  return (
    <main>
      <PageHeader
        eyebrow="Flash One AI"
        title="Project idea assistant"
        description="AI can suggest a work request. It cannot take payment, change invoices, or create a request until you confirm."
      />
      {configured ? (
        <p className="mt-4 text-sm text-muted">
          Development assistant is available. Responses are deterministic and labelled as a test assistant, not a live language model.
        </p>
      ) : (
        <EmptyState
          title="Assistant unavailable"
          description={
            status.developmentOnly
              ? "A development assistant exists but is not enabled. Flash One does not invent replies while the provider is off."
              : "No AI provider is configured. Flash One does not generate substitute answers."
          }
        />
      )}
      {messages.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {messages.map((message) => (
            <li
              key={message.public_id}
              className="rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy/50">
                {message.role === "assistant" ? "Assistant" : "You"}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-[15px] text-navy">{message.body}</p>
              <p className="mt-2 text-xs text-muted">{formatDisplayDateTime(message.created_at)}</p>
            </li>
          ))}
        </ul>
      ) : configured ? (
        <p className="mt-8 text-[15px] text-muted">No conversation yet. Describe an idea to start.</p>
      ) : null}
      {suggestion.length > 0 ? (
        <SectionPanel title="Structured suggestion">
          <dl className="space-y-3 text-[15px]">
            {suggestion.map((field) => (
              <div key={field.label}>
                <dt className="text-sm text-muted">{field.label}</dt>
                <dd className="mt-1 whitespace-pre-wrap text-navy">{field.text}</dd>
              </div>
            ))}
          </dl>
        </SectionPanel>
      ) : null}
      <AiAssistantForm
        conversationPublicId={activeId}
        organizations={summary.organizations}
        hasIndividual={Boolean(summary.individual)}
        configured={configured}
        canConfirm={configured && suggestion.length > 0}
      />
    </main>
  );
}
