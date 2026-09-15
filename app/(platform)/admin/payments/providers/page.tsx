import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/server/auth";
import { logoutAction } from "@/app/(auth)/actions";
import { listProviderAdminRows, listRecentProviderEvents } from "@/lib/server/payments";
import { PAYMENT_PATHS } from "@/modules/payments";
import { adminSetProviderStateAction } from "../../payment-requests/actions";

export default async function AdminProvidersPage() {
  const access = await requirePlatformAdmin(PAYMENT_PATHS.adminProviders);
  if (!access.authorized) {
    return <Unauthorized />;
  }
  const [providers, events] = await Promise.all([
    listProviderAdminRows(),
    listRecentProviderEvents(),
  ]);
  return (
    <main>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Payment providers
      </h1>
      <p className="mt-3 text-[15px] text-muted">
        Kill switches and configuration state. Secret values are never shown.
      </p>
      <ul className="mt-8 space-y-4">
        {providers.map((provider) => (
          <li
            key={provider.code}
            className="rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft)"
          >
            <p className="font-extrabold text-navy-deep">{provider.displayName}</p>
            <p className="mt-1 text-sm text-muted">
              {provider.operationalState}
              {provider.secretsConfigured ? " · credentials present" : " · configuration required"}
              {provider.checkoutReady ? " · checkout ready" : " · checkout not ready"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {provider.eligibility} · {provider.supportedCurrencies.join(", ")}
            </p>
            <p className="mt-2 text-sm">{provider.notes}</p>
            <p className="mt-2 text-xs text-muted">
              Capabilities: {JSON.stringify(provider.capabilities)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {provider.secretsConfigured ? (
                <form action={adminSetProviderStateAction}>
                  <input type="hidden" name="code" value={provider.code} />
                  <input type="hidden" name="state" value="enabled" />
                  <button type="submit" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold">
                    Enable
                  </button>
                </form>
              ) : null}
              <form action={adminSetProviderStateAction}>
                <input type="hidden" name="code" value={provider.code} />
                <input type="hidden" name="state" value="disabled" />
                <button type="submit" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold">
                  Disable
                </button>
              </form>
              <form action={adminSetProviderStateAction}>
                <input type="hidden" name="code" value={provider.code} />
                <input type="hidden" name="state" value="maintenance" />
                <button type="submit" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold">
                  Maintenance
                </button>
              </form>
              <form action={adminSetProviderStateAction}>
                <input type="hidden" name="code" value={provider.code} />
                <input type="hidden" name="state" value="configuration_required" />
                <button type="submit" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold">
                  Configuration required
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      <section className="mt-12">
        <h2 className="text-lg font-extrabold text-navy-deep">Recent provider events</h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No provider events.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {events.map((event) => (
              <li key={`${event.provider}-${event.external_event_id}`} className="rounded-2xl border border-line bg-white px-4 py-3">
                {event.provider} · {event.event_type} · {event.processing_status}
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="mt-8 text-sm">
        <Link href={PAYMENT_PATHS.adminList} className="font-semibold text-blue">
          Back to financial records
        </Link>
      </p>
    </main>
  );
}

function Unauthorized() {
  return (
    <main>
      <h1 className="text-3xl font-extrabold text-navy-deep">Not authorized</h1>
      <form action={logoutAction} className="mt-8">
        <button type="submit" className="rounded-(--radius-button) border border-line bg-white px-5 py-2.5 text-sm font-semibold">
          Sign out
        </button>
      </form>
    </main>
  );
}
