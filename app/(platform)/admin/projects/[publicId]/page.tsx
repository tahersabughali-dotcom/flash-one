import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
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
import { senderLabel } from "@/modules/conversations";
import { PROJECT_PATHS, PROJECT_STATUS_LABELS } from "@/modules/projects";
import { WORK_REQUEST_PATHS } from "@/modules/work-requests";
import { QUOTE_PATHS } from "@/modules/quotes";
import { CONTRACT_PATHS, CONTRACT_STATUS_LABELS } from "@/modules/contracts";
import { TASK_STATUS_LABELS } from "@/modules/tasks";
import { DELIVERABLE_STATUS_LABELS } from "@/modules/deliverables";
import { AdminProjectStatusForm } from "../status-form";
import { AdminTaskCreateForm } from "../task-create-form";
import { AdminTaskEditForm } from "../task-edit-form";
import { AdminFileUploadForm } from "../file-upload-form";
import { AdminDeliverableForm } from "../deliverable-form";
import { AdminMessageForm } from "../message-form";
import { downloadProjectFileAction } from "@/app/(platform)/app/projects/actions";
import { adminSubmitDeliverableAction } from "../actions";
import { listProjectTeam, optionLists } from "@/lib/server/operations";
import { TEAM_MEMBER_KIND_LABELS, TEAM_ROLE_LABELS } from "@/modules/operations";
import { ProjectTeamForm, TaskAssigneeForm } from "../../team-forms";
import { adminEndTeamAction } from "../../operations-actions";

import { FILE_VISIBILITY_LABELS, malwareScanLabel } from "@/modules/files";
import { formatDisplayDate, formatFileSize } from "@/lib/format/display";

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const access = await requirePlatformAdmin(PROJECT_PATHS.adminDetail(publicId));
  if (!access.authorized) {
    return (
      <main>
        <h1 className="text-3xl font-extrabold text-navy-deep">Not authorized</h1>
        <form action={logoutAction} className="mt-8">
          <button
            type="submit"
            className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold"
          >
            Sign out
          </button>
        </form>
      </main>
    );
  }

  const project = await getProjectByPublicId(publicId);
  if (!project) {
    notFound();
  }

  const [contracts, tasks, files, deliverables, conversation, activity, team, options] =
    await Promise.all([
      listContractsForProject(project.id),
      listProjectTasks(project.id),
      listProjectFiles(project.id),
      listProjectDeliverables(project.id),
      getProjectConversation(project.id),
      listProjectActivity(project.id),
      listProjectTeam(project.id),
      optionLists(),
    ]);
  const messages = conversation
    ? await listConversationMessages(conversation.id, access.userId)
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
          ["team", "Team"],
          ["tasks", "Tasks"],
          ["deliverables", "Deliverables"],
          ["files", "Files"],
          ["conversation", "Conversation"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={`#${href}`}
            className="rounded-full border border-line bg-white px-3 py-1.5 font-semibold"
          >
            {label}
          </a>
        ))}
      </nav>

      <section id="overview" className="mt-10">
        <ul className="space-y-2 text-sm">
          <li>
            Request{" "}
            <Link
              href={WORK_REQUEST_PATHS.adminDetail(project.workRequestPublicId)}
              className="font-semibold text-blue"
            >
              {project.workRequestPublicId}
            </Link>
          </li>
          <li>
            Quote{" "}
            <Link href={QUOTE_PATHS.detail(project.acceptedQuotePublicId)} className="font-semibold text-blue">
              {project.acceptedQuotePublicId}
            </Link>
          </li>
        </ul>
        <AdminProjectStatusForm publicId={project.publicId} currentStatus={project.status} />
        {contracts.map((contract) => (
          <p key={contract.publicId} className="mt-4 text-sm">
            <Link href={CONTRACT_PATHS.detail(contract.publicId)} className="font-semibold text-blue">
              {contract.publicId}
            </Link>{" "}
            · {CONTRACT_STATUS_LABELS[contract.status]}
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

      <section id="team" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Team
        </h2>
        <ProjectTeamForm projectPublicId={project.publicId} options={options} />
        <ul className="mt-6 space-y-3">
          {team.map((member) => (
            <li key={member.public_id} className="rounded-2xl border border-line bg-white px-5 py-4">
              <p className="font-semibold">
                {TEAM_MEMBER_KIND_LABELS[member.member_kind as keyof typeof TEAM_MEMBER_KIND_LABELS] ?? member.member_kind}
                {" · "}
                {TEAM_ROLE_LABELS[member.role_label as keyof typeof TEAM_ROLE_LABELS] ?? member.role_label}
              </p>
              <p className="text-sm text-muted">
                {member.public_id} · {member.status}
              </p>
              {member.status === "active" ? (
                <form action={adminEndTeamAction} className="mt-2">
                  <input type="hidden" name="publicId" value={member.public_id} />
                  <input type="hidden" name="projectPublicId" value={project.publicId} />
                  <button type="submit" className="text-sm font-semibold text-blue">
                    End assignment
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section id="tasks" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Tasks
        </h2>
        <AdminTaskCreateForm projectPublicId={project.publicId} />
        <ul className="mt-6 space-y-4">
          {tasks.map((task) => (
            <li key={task.publicId} className="rounded-2xl border border-line bg-white px-5 py-4">
              <p className="text-sm text-muted">
                {task.publicId} · {TASK_STATUS_LABELS[task.status]}
                {task.customerVisible ? " · Customer visible" : " · Internal"}
              </p>
              <AdminTaskEditForm projectPublicId={project.publicId} task={task} />
              <p className="mt-2 text-sm text-muted">
                Assignee: {task.assigneeKind ?? "unassigned"}
              </p>
              <TaskAssigneeForm
                projectPublicId={project.publicId}
                taskPublicId={task.publicId}
                options={options}
              />
            </li>
          ))}
        </ul>
      </section>

      <section id="files" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Files
        </h2>
        <AdminFileUploadForm projectPublicId={project.publicId} />
        <ul className="mt-4 space-y-3">
          {files.map((file) => (
            <li key={file.publicId} className="rounded-2xl border border-line bg-white px-5 py-4">
              <p className="font-semibold">{file.originalFilename}</p>
              <p className="text-sm text-muted">
                {FILE_VISIBILITY_LABELS[file.visibility]} · {formatFileSize(file.sizeBytes)} ·{" "}
                {formatDisplayDate(file.createdAt)} · Scan: {malwareScanLabel(file.malwareScanStatus)}
              </p>
              <form action={downloadProjectFileAction} className="mt-2">
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

      <section id="deliverables" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Deliverables
        </h2>
        <AdminDeliverableForm projectPublicId={project.publicId} files={files} />
        <ul className="mt-6 space-y-3">
          {deliverables.map((deliverable) => (
            <li key={deliverable.publicId} className="rounded-2xl border border-line bg-white px-5 py-4">
              <p className="font-semibold">
                {deliverable.publicId} · {deliverable.title} · v{deliverable.version}
              </p>
              <p className="text-sm text-muted">
                {DELIVERABLE_STATUS_LABELS[deliverable.status]}
              </p>
              {deliverable.status === "draft" ? (
                <form action={adminSubmitDeliverableAction} className="mt-3">
                  <input type="hidden" name="projectPublicId" value={project.publicId} />
                  <input type="hidden" name="deliverablePublicId" value={deliverable.publicId} />
                  <button type="submit" className="text-sm font-semibold text-blue">
                    Submit to customer
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section id="conversation" className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">
          Conversation
        </h2>
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
            </li>
          ))}
        </ul>
        )}
        <AdminMessageForm projectPublicId={project.publicId} />
      </section>
    </main>
  );
}
