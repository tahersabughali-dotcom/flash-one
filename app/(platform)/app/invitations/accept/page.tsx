import { requireAuthenticatedUser } from "@/lib/server/auth";
import { ACCOUNT_PATHS } from "@/modules/account";
import { InvitationAcceptForm } from "./accept-form";

export default async function InvitationAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const next = token
    ? `${ACCOUNT_PATHS.invitationsAccept}?token=${encodeURIComponent(token)}`
    : ACCOUNT_PATHS.invitationsAccept;
  await requireAuthenticatedUser(next);

  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        Invitation
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Join a business
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        This invitation can only be accepted by the signed-in email it was created for.
        No email is sent by Flash One yet.
      </p>
      {token ? (
        <InvitationAcceptForm token={token} />
      ) : (
        <p className="mt-8 text-[15px] text-muted">This invitation link is incomplete.</p>
      )}
    </main>
  );
}
