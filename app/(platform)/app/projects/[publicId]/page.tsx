import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getProjectAccess, getProjectByPublicId } from "@/lib/server/projects";
import { ACCOUNT_PATHS } from "@/modules/account";
import { senderLabel } from "@/modules/conversations";
import { listContractsForProject } from "@/lib/server/contracts";
import { listProjectTasks } from "@/lib/server/tasks";
import { listProjectFiles } from "@/lib/server/files";
import { listProjectDeliverables } from "@/lib/server/deliverables";
import {
  getProjectConversation,
  listConversationMessages,
} from "@/lib/server/conversations";
import { listProjectActivity } from "@/lib/server/activity";
import { PROJECT_PATHS, PROJECT_STATUS_LABELS } from "@/modules/projects";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { QUOTE_PATHS } from "@/modules/quotes";
import {
  CONTRACT_DOCUMENT_TYPE_LABELS,
  CONTRACT_PATHS,
  CONTRACT_STATUS_LABELS,
} from "@/modules/contracts";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/modules/tasks";
import { DELIVERABLE_STATUS_LABELS } from "@/modules/deliverables";
import { FILE_VISIBILITY_LABELS, malwareScanLabel } from "@/modules/files";
import { formatDisplayDate, formatDisplayDateTime, formatFileSize } from "@/lib/format/display";
import { PageHeader } from "@/components/platform/PageHeader";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { CustomerFileUploadForm } from "../file-upload-form";
import { CustomerMessageForm } from "../message-form";
import { CustomerDeliverableReview } from "../deliverable-review";
import { downloadProjectFileAction } from "../actions";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const { session } = await requireCompletedOnboarding(PROJECT_PATHS.detail(publicId));
  const project = await getProjectByPublicId(publicId);
  if (!project) {
    notFound();
  }
  const access = await getProjectAccess(project.id);
  if (!access.customer && access.developer) {
    redirect(ACCOUNT_PATHS.developerProject(publicId));
  }
  if (!access.customer) {
    notFound();
  }

  const [contracts, tasks, files, deliverables, conversation, activity] =
    await Promise.all([
      listContractsForProject(project.id),
      listProjectTasks(project.id),
      listProjectFiles(project.id),
      listProjectDeliverables(project.id),
      getProjectConversation(project.id),
      listProjectActivity(project.id),
    ]);
  const messages = conversation
    ? await listConversationMessages(conversation.id, session.userId)
    : [];
  const customerTasks = tasks.filter((task) => task.customerVisible);
  const customerFiles = files.filter((file) => file.visibility === "customer");

  return (
    <main>
      <PageHeader
        eyebrow={project.publicId}
        title={project.name}
        actions={
          <StatusBadge status={project.status} label={PROJECT_STATUS_LABELS[project.status]} />
        }
      />
      <nav className="mt-6 flex flex-wrap gap-2 text-sm" aria-label="Project sections">
        {[
          ["overview", "Overview"],
          ["tasks", "Tasks"],
          ["deliverables", "Deliverables"],
          ["files", "Files"],
          ["conversation", "Conversation"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={`#${href}`}
            className="rounded-full border border-line bg-white px-3 py-1.5 font-semibold text-navy"
          >
            {label}
          </a>
        ))}
      </nav>

      <section id="overview" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Overview
        </h2>
        <ul className="mt-4 space-y-2 text-[15px] text-navy">
          <li>
            Request:{" "}
            <Link
              href={WORK_REQUEST_PATHS.detail(project.workRequestPublicId)}
              className="font-semibold text-blue"
            >
              {project.workRequestPublicId}
            </Link>
          </li>
          <li>
            Accepted quote:{" "}
            <Link
              href={QUOTE_PATHS.detail(project.acceptedQuotePublicId)}
              className="font-semibold text-blue"
            >
              {project.acceptedQuotePublicId}
            </Link>
          </li>
          {project.startedAt ? <li>Started: {formatDisplayDate(project.startedAt)}</li> : null}
          {project.completedAt ? <li>Completed: {formatDisplayDate(project.completedAt)}</li> : null}
        </ul>
        {contracts.map((contract) => (
          <p key={contract.publicId} className="mt-3 text-sm">
            <Link href={CONTRACT_PATHS.detail(contract.publicId)} className="font-semibold text-blue">
              {contract.publicId}
            </Link>{" "}
            · {CONTRACT_DOCUMENT_TYPE_LABELS[contract.documentType]} ·{" "}
            {CONTRACT_STATUS_LABELS[contract.status]}
          </p>
        ))}
        {activity.length > 0 ? (
          <ul className="mt-6 space-y-2 text-sm text-muted">
            {activity.map((item) => (
              <li key={`${item.eventType}-${item.createdAt}`}>
                {item.label} · {formatDisplayDate(item.createdAt)}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section id="tasks" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Tasks
        </h2>
        {customerTasks.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">No customer-visible tasks yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {customerTasks.map((task) => (
              <li key={task.publicId} className="rounded-2xl border border-line bg-white px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-navy-deep">{task.title}</p>
                  <StatusBadge status={task.status} label={TASK_STATUS_LABELS[task.status]} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {TASK_PRIORITY_LABELS[task.priority]}
                  {task.dueAt ? ` · Due ${formatDisplayDate(task.dueAt)}` : ""}
                </p>
                {task.description ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-navy">{task.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="deliverables" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Deliverables
        </h2>
        {deliverables.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">No deliveries have been submitted yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {deliverables.map((deliverable) => (
              <li
                key={deliverable.publicId}
                className="rounded-2xl border border-line bg-white px-5 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-navy-deep">
                    {deliverable.title} · v{deliverable.version}
                  </p>
                  <StatusBadge
                    status={deliverable.status}
                    label={DELIVERABLE_STATUS_LABELS[deliverable.status]}
                  />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {deliverable.submittedAt
                    ? formatDisplayDate(deliverable.submittedAt)
                    : "Not submitted yet"}
                </p>
                {deliverable.description ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm">{deliverable.description}</p>
                ) : null}
                {deliverable.fileSnapshot.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm">
                    {deliverable.fileSnapshot.map((file) => (
                      <li key={file.publicId}>{file.filename}</li>
                    ))}
                  </ul>
                ) : null}
                {deliverable.changeRequestNote ? (
                  <p className="mt-3 text-sm text-muted">{deliverable.changeRequestNote}</p>
                ) : null}
                {deliverable.status === "submitted" ? (
                  <CustomerDeliverableReview
                    projectPublicId={project.publicId}
                    deliverablePublicId={deliverable.publicId}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="files" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Files
        </h2>
        <p className="mt-2 text-sm text-muted">
          Customer-visible files only. Internal files stay inside the project team.
        </p>
        <CustomerFileUploadForm projectPublicId={project.publicId} />
        {customerFiles.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">No customer-visible files yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {customerFiles.map((file) => (
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
                  <button type="submit" className="text-sm font-semibold text-blue">
                    Download
                  </button>
                </form>
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
          This is the project conversation in Flash One. It is not email, WhatsApp, or SMS.
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
                <p className="mt-2 whitespace-pre-wrap text-[15px] text-navy">{message.body}</p>
                <p className="mt-2 text-xs text-muted">{formatDisplayDateTime(message.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
        <CustomerMessageForm projectPublicId={project.publicId} />
      </section>

      <p className="mt-10 text-sm">
        <Link href={PROJECT_PATHS.list} className="font-semibold text-blue">
          Back to projects
        </Link>
      </p>
    </main>
  );
}
