"use client";

import { useActionState } from "react";
import {
  createOrganizationInvitationAction,
  removeOrganizationMemberAction,
  revokeOrganizationInvitationAction,
  updateOrganizationProfileAction,
  type RelationshipFormState,
} from "@/app/(platform)/app/relationships/actions";

const initialState: RelationshipFormState = { error: null };

export function OrganizationOwnerTools({
  organizationPublicId,
  name,
  website,
  country,
  description,
  members,
  invitations,
  currentUserId,
}: {
  organizationPublicId: string;
  name: string;
  website: string | null;
  country: string | null;
  description: string | null;
  members: Array<{ userId: string; role: "owner" | "member"; displayName: string }>;
  invitations: Array<{ id: string; publicId: string; invitedEmail: string; status: string; expiresAt: string }>;
  currentUserId: string;
}) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateOrganizationProfileAction,
    initialState,
  );
  const [inviteState, inviteAction, invitePending] = useActionState(
    createOrganizationInvitationAction,
    initialState,
  );

  return (
    <div className="mt-10 space-y-8">
      <form action={profileAction} className="space-y-3 rounded-2xl border border-line bg-white p-5">
        <input type="hidden" name="organizationPublicId" value={organizationPublicId} />
        <p className="font-semibold text-navy-deep">Business details</p>
        <input name="name" defaultValue={name} required maxLength={120} className="w-full rounded-2xl border border-line px-4 py-3" />
        <input
          name="website"
          defaultValue={website ?? ""}
          placeholder="https://example.com"
          className="w-full rounded-2xl border border-line px-4 py-3"
        />
        <input
          name="country"
          defaultValue={country ?? ""}
          placeholder="Country (optional)"
          className="w-full rounded-2xl border border-line px-4 py-3"
        />
        <textarea
          name="description"
          defaultValue={description ?? ""}
          rows={3}
          placeholder="Short description (optional)"
          className="w-full rounded-2xl border border-line px-4 py-3"
        />
        {profileState.error ? (
          <p className="text-sm font-medium text-red-700">{profileState.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={profilePending}
          className="rounded-(--radius-button) bg-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {profilePending ? "Saving…" : "Save details"}
        </button>
      </form>

      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="font-semibold text-navy-deep">Members</p>
        <ul className="mt-3 space-y-3">
          {members.map((member) => (
            <li key={member.userId} className="flex flex-wrap items-center justify-between gap-3">
              <span>
                {member.displayName} · {member.role}
              </span>
              {member.role === "member" && member.userId !== currentUserId ? (
                <form action={removeOrganizationMemberAction}>
                  <input type="hidden" name="organizationPublicId" value={organizationPublicId} />
                  <input type="hidden" name="memberUserId" value={member.userId} />
                  <button type="submit" className="text-sm font-semibold text-red-700">
                    Remove
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <form action={inviteAction} className="space-y-3 rounded-2xl border border-line bg-white p-5">
        <input type="hidden" name="organizationPublicId" value={organizationPublicId} />
        <p className="font-semibold text-navy-deep">Invite a member</p>
        <p className="text-sm text-muted">
          Email delivery is not enabled yet. Copy the invitation link after you create it.
        </p>
        <input
          name="email"
          type="email"
          required
          placeholder="member@example.com"
          className="w-full rounded-2xl border border-line px-4 py-3"
        />
        {inviteState.error ? (
          <p className="text-sm font-medium text-red-700">{inviteState.error}</p>
        ) : null}
        {inviteState.invitationToken ? (
          <p className="break-all text-sm text-navy">
            Invitation link (shown once): /app/invitations/accept?token=
            {inviteState.invitationToken}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={invitePending}
          className="rounded-(--radius-button) bg-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {invitePending ? "Creating…" : "Create invitation"}
        </button>
      </form>

      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="font-semibold text-navy-deep">Invitations</p>
        {invitations.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No invitations yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {invitations.map((invitation) => (
              <li key={invitation.publicId} className="flex flex-wrap items-center justify-between gap-3">
                <span>
                  {invitation.invitedEmail} · {invitation.status}
                </span>
                {invitation.status === "pending" ? (
                  <form action={revokeOrganizationInvitationAction}>
                    <input type="hidden" name="organizationPublicId" value={organizationPublicId} />
                    <input type="hidden" name="invitationId" value={invitation.id} />
                    <button type="submit" className="text-sm font-semibold text-red-700">
                      Revoke
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
