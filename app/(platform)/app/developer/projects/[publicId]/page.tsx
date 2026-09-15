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
import { senderLabel } from "@/modules/conversations";
import { downloadProjectFileAction } from "../../../projects/actions";
import { DeveloperFileUploadForm, DeveloperMessageForm } from "../workspace-forms";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {project.publicId}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {project.name}
      </h1>
      <p className="mt-4 text-[15px] text-muted">{PROJECT_STATUS_LABELS[project.status]}</p>
      <p className="mt-2 text-sm text-muted">
        Project developer workspace. Commercial quote internals and customer administration are not included.
      </p>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Tasks</h2>
        {tasks.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">No tasks to show yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {tasks.map((task) => (
              <li key={task.publicId} className="rounded-2xl border border-line bg-white px-5 py-4">
                <p className="font-semibold text-navy-deep">{task.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {TASK_STATUS_LABELS[task.status]} · {TASK_PRIORITY_LABELS[task.priority]}
                  {task.customerVisible ? "" : " · Internal to project team"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="files" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Files</h2>
        <DeveloperFileUploadForm projectPublicId={project.publicId} />
        <ul className="mt-4 space-y-3">
          {visibleFiles.map((file) => (
            <li key={file.publicId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4">
              <div>
                <p className="font-semibold text-navy-deep">{file.originalFilename}</p>
                <p className="text-sm text-muted">{file.visibility}</p>
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
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">Deliverables</h2>
        {deliverables.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">No submitted deliverables.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {deliverables.map((deliverable) => (
              <li key={deliverable.publicId} className="rounded-2xl border border-line bg-white px-5 py-4">
                <p className="font-semibold text-navy-deep">
                  {deliverable.title} · v{deliverable.version}
                </p>
                <p className="text-sm text-muted">{DELIVERABLE_STATUS_LABELS[deliverable.status]}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="conversation" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Conversation
        </h2>
        <ul className="mt-4 space-y-3">
          {messages.map((message) => (
            <li key={message.publicId} className="rounded-2xl border border-line bg-white px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy/50">
                {senderLabel(message.senderKind, message.isSelf)}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-[15px]">{message.body}</p>
              <p className="mt-2 text-xs text-muted">{formatDate(message.createdAt)}</p>
            </li>
          ))}
        </ul>
        <DeveloperMessageForm projectPublicId={project.publicId} />
      </section>

      {activity.length > 0 ? (
        <ul className="mt-8 space-y-2 text-sm text-muted">
          {activity.map((item) => (
            <li key={`${item.eventType}-${item.createdAt}`}>
              {item.label} · {formatDate(item.createdAt)}
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
