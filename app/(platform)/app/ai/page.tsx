import { requireCompletedOnboarding } from "@/lib/server/account";
import { getAiStatus, isDevelopmentAiEnabled, listAiConversations, listAiMessages } from "@/lib/server/ai/core";
import { AI_PATHS } from "@/modules/ai";
import { AiAssistantForm } from "./assistant-form";

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

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        Flash One AI
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Project idea assistant
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        AI can suggest a work request. It cannot take payment, change invoices, or create a request until you confirm.
      </p>
      {configured ? (
        <p className="mt-4 text-sm text-muted">
          Development assistant is available. Responses are deterministic and labelled as a test assistant, not a live language model.
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted">AI is not configured. You can still structure an idea below when an assistant is enabled.</p>
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
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-[15px] text-muted">No conversation yet.</p>
      )}
      <AiAssistantForm
        conversationPublicId={activeId}
        organizations={summary.organizations}
        hasIndividual={Boolean(summary.individual)}
        configured={configured}
      />
    </main>
  );
}
