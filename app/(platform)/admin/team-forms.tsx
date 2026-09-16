"use client";

import { useActionState } from "react";
import {
  TEAM_MEMBER_KINDS,
  TEAM_MEMBER_KIND_LABELS,
  TEAM_ROLE_LABELS,
  TEAM_ROLE_LABELS_VALUES,
  TASK_ASSIGNEE_KINDS,
} from "@/modules/operations";
import {
  adminAssignTeamAction,
  adminSetTaskAssigneeAction,
  type AdminOpsFormState,
} from "./operations-actions";

const initial: AdminOpsFormState = { error: null };

export function ProjectTeamForm({
  projectPublicId,
  options,
}: {
  projectPublicId: string;
  options: {
    employees: Array<{ public_id: string; display_name: string }>;
    freelancers: Array<{ public_id: string; display_name: string }>;
    partners: Array<{ public_id: string; name: string }>;
    developers: Array<{ public_id: string; display_name: string }>;
  };
}) {
  const [state, action, pending] = useActionState(adminAssignTeamAction, initial);
  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="projectPublicId" value={projectPublicId} />
      <select name="memberKind" defaultValue="developer" className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm">
        {TEAM_MEMBER_KINDS.map((kind) => (
          <option key={kind} value={kind}>
            {TEAM_MEMBER_KIND_LABELS[kind]}
          </option>
        ))}
      </select>
      <input name="memberPublicId" required placeholder="Member public ID" list="team-members" className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm" />
      <datalist id="team-members">
        {options.employees.map((item) => (
          <option key={item.public_id} value={item.public_id} label={`Employee · ${item.display_name}`} />
        ))}
        {options.developers.map((item) => (
          <option key={item.public_id} value={item.public_id} label={`Developer · ${item.display_name}`} />
        ))}
        {options.freelancers.map((item) => (
          <option key={item.public_id} value={item.public_id} label={`Freelancer · ${item.display_name}`} />
        ))}
        {options.partners.map((item) => (
          <option key={item.public_id} value={item.public_id} label={`Partner · ${item.name}`} />
        ))}
      </datalist>
      <select name="roleLabel" defaultValue="developer" className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm">
        {TEAM_ROLE_LABELS_VALUES.map((role) => (
          <option key={role} value={role}>
            {TEAM_ROLE_LABELS[role]}
          </option>
        ))}
      </select>
      <p className="text-sm text-muted">Role labels do not grant platform admin.</p>
      {state.error ? <p className="text-sm font-medium text-red-700">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : "Assign team member"}
      </button>
    </form>
  );
}

export function TaskAssigneeForm({
  projectPublicId,
  taskPublicId,
  options,
}: {
  projectPublicId: string;
  taskPublicId: string;
  options: {
    employees: Array<{ public_id: string; display_name: string }>;
    freelancers: Array<{ public_id: string; display_name: string }>;
    developers: Array<{ public_id: string; display_name: string }>;
  };
}) {
  const [state, action, pending] = useActionState(adminSetTaskAssigneeAction, initial);
  return (
    <form action={action} className="mt-2 flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="projectPublicId" value={projectPublicId} />
      <input type="hidden" name="taskPublicId" value={taskPublicId} />
      <select name="assigneeKind" className="rounded-2xl border border-line bg-white px-3 py-2 text-sm">
        <option value="">Unassigned</option>
        {TASK_ASSIGNEE_KINDS.map((kind) => (
          <option key={kind} value={kind}>
            {kind}
          </option>
        ))}
      </select>
      <input name="assigneePublicId" placeholder="Assignee public ID" list={`assignees-${taskPublicId}`} className="flex-1 rounded-2xl border border-line bg-white px-3 py-2 text-sm" />
      <datalist id={`assignees-${taskPublicId}`}>
        {options.employees.map((item) => (
          <option key={item.public_id} value={item.public_id} label={item.display_name} />
        ))}
        {options.freelancers.map((item) => (
          <option key={item.public_id} value={item.public_id} label={item.display_name} />
        ))}
        {options.developers.map((item) => (
          <option key={item.public_id} value={item.public_id} label={item.display_name} />
        ))}
      </datalist>
      <button type="submit" disabled={pending} className="text-sm font-semibold text-blue disabled:opacity-60">
        {pending ? "Saving…" : "Assign"}
      </button>
      {state.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
    </form>
  );
}
