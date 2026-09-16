import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getProjectAccess, getProjectByPublicId } from "@/lib/server/projects";
import { listProjectTasks } from "@/lib/server/tasks";
import { listProjectFiles } from "@/lib/server/files";
import { listProjectDeliverables } from "@/lib/server/deliverables";
import {
  getProjectConversation,
  listConversationMessages,
} from "@/lib/server/conversations";
import { listProjectActivity } from "@/lib/server/activity";
import { ACCOUNT_PATHS } from "@/modules/account";
import { PROJECT_STATUS_LABELS } from "@/modules/projects";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/modules/tasks";
import { DELIVERABLE_STATUS_LABELS } from "@/modules/deliverables";
import { FILE_VISIBILITY_LABELS, malwareScanLabel } from "@/modules/files";
import { senderLabel } from "@/modules/conversations";
import { formatDisplayDate, formatDisplayDateTime, formatFileSize } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { downloadProjectFileAction } from "../../../projects/actions";
import { DeveloperFileUploadForm, DeveloperMessageForm } from "../workspace-forms";

export default async function DeveloperProjectPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const { session } = await requireCompletedOnboarding(ACCOUNT_PATHS.developerProject(publicId));
  const project = await getProjectByPublicId(publicId);
  if (!project) {
    notFound();
  }
  const access = await getProjectAccess(project.id);
  if (!access.developer) {
    notFound();
  }

  const [tasks, files, deliverables, conversation, activity] = await Promise.all([
    listProjectTasks(project.id),
    listProjectFiles(project.id),
    listProjectDeliverables(project.id),
    getProjectConversation(project.id),
    listProjectActivity(project.id),
  ]);
  const messages = conversation
    ? await listConversationMessages(conversation.id, session.userId)
    : [];
  const visibleFiles = files.filter(
    (file) => file.visibility === "customer" || file.visibility === "project_team",
  );

  return (
    <main>
      <PageHeader
        eyebrow={project.publicId}
        title={project.name}
        description="Project developer workspace. Customer invoices, payments, and ledger records are not included."
        actions={
          <StatusBadge status={project.status} label={PROJECT_STATUS_LABELS[project.status]} />
        }
      />

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Tasks</h2>
        {tasks.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">No tasks to show yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {tasks.map((task) => (
              <li key={task.publicId} className="rounded-2xl border border-line bg-white px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-navy-deep">{task.title}</p>
                  <StatusBadge status={task.status} label={TASK_STATUS_LABELS[task.status]} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {TASK_PRIORITY_LABELS[task.priority]}
                  {task.dueAt ? ` · Due ${formatDisplayDate(task.dueAt)}` : ""}
                  {task.customerVisible ? "" : " · Internal to project team"}
                </p>
                {task.description ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-navy">{task.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="files" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Files</h2>
        <DeveloperFileUploadForm projectPublicId={project.publicId} />
        {visibleFiles.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">No files visible to the project team yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {visibleFiles.map((file) => (
              <li
                key={file.publicId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-navy-deep">{file.originalFilename}</p>
                  <p className="text-sm text-muted">
                    {FILE_VISIBILITY_LABELS[file.visibility]} · {formatFileSize(file.sizeBytes)} ·{" "}
                    {formatDisplayDate(file.createdAt)} · Scan: {malwareScanLabel(file.malwareScanStatus)}
                  </p>
                </div>
                <form action={downloadProjectFileAction}>
                  <input type="hidden" name="filePublicId" value={file.publicId} />
                  <input type="hidden" name="projectPublicId" value={project.publicId} />
                  <input type="hidden" name="workspace" value="developer" />
                  <button type="submit" className="text-sm font-semibold text-blue">
                    Download
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Deliverables
        </h2>
        {deliverables.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">No submitted deliverables.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {deliverables.map((deliverable) => (
              <li key={deliverable.publicId} className="rounded-2xl border border-line bg-white px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-navy-deep">
                    {deliverable.title} · v{deliverable.version}
                  </p>
                  <StatusBadge
                    status={deliverable.status}
                    label={DELIVERABLE_STATUS_LABELS[deliverable.status]}
                  />
                </div>
                {deliverable.submittedAt ? (
                  <p className="mt-1 text-sm text-muted">
                    {formatDisplayDate(deliverable.submittedAt)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="conversation" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Conversation
        </h2>
        <p className="mt-2 text-sm text-muted">
          Project conversation in Flash One. This is not email, WhatsApp, or SMS.
        </p>
        {messages.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">No messages yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {messages.map((message) => (
              <li key={message.publicId} className="rounded-2xl border border-line bg-white px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy/50">
                  {senderLabel(message.senderKind, message.isSelf)}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[15px]">{message.body}</p>
                <p className="mt-2 text-xs text-muted">{formatDisplayDateTime(message.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
        <DeveloperMessageForm projectPublicId={project.publicId} />
      </section>

      {activity.length > 0 ? (
        <ul className="mt-8 space-y-2 text-sm text-muted">
          {activity.map((item) => (
            <li key={`${item.eventType}-${item.createdAt}`}>
              {item.label} · {formatDisplayDate(item.createdAt)}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-10 text-sm">
        <Link href={ACCOUNT_PATHS.developerProjects} className="font-semibold text-blue">
          Back to assigned projects
        </Link>
      </p>
    </main>
  );
}
