import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompletedOnboarding } from "@/lib/server/account";
import { getProjectByPublicId } from "@/lib/server/projects";
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
import { CustomerFileUploadForm } from "../file-upload-form";
import { CustomerMessageForm } from "../message-form";
import { CustomerDeliverableReview } from "../deliverable-review";
import { downloadProjectFileAction } from "../actions";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

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

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {project.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {project.name}
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        {PROJECT_STATUS_LABELS[project.status]}
      </p>
      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
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
          {project.startedAt ? <li>Started: {formatDate(project.startedAt)}</li> : null}
          {project.completedAt ? <li>Completed: {formatDate(project.completedAt)}</li> : null}
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
                {item.label} · {formatDate(item.createdAt)}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section id="tasks" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Tasks
        </h2>
        {tasks.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">No tasks to show yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {tasks.map((task) => (
              <li key={task.publicId} className="rounded-2xl border border-line bg-white px-5 py-4">
                <p className="font-semibold text-navy-deep">{task.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {TASK_STATUS_LABELS[task.status]} · {TASK_PRIORITY_LABELS[task.priority]}
                  {task.dueAt ? ` · Due ${formatDate(task.dueAt)}` : ""}
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
                <p className="font-semibold text-navy-deep">
                  {deliverable.title} · v{deliverable.version}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {DELIVERABLE_STATUS_LABELS[deliverable.status]}
                  {deliverable.submittedAt ? ` · ${formatDate(deliverable.submittedAt)}` : ""}
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
        <CustomerFileUploadForm projectPublicId={project.publicId} />
        <ul className="mt-4 space-y-3">
          {files.map((file) => (
            <li
              key={file.publicId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4"
            >
              <div>
                <p className="font-semibold text-navy-deep">{file.originalFilename}</p>
                <p className="text-sm text-muted">
                  {formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}
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
      </section>

      <section id="conversation" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Conversation
        </h2>
        <ul className="mt-4 space-y-3">
          {messages.map((message) => (
            <li key={message.publicId} className="rounded-2xl border border-line bg-white px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy/50">
                {message.isSelf ? "You" : message.senderKind === "staff" ? "Flash One" : "Customer"}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-[15px] text-navy">{message.body}</p>
              <p className="mt-2 text-xs text-muted">{formatDate(message.createdAt)}</p>
            </li>
          ))}
        </ul>
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
