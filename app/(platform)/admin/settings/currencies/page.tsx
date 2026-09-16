import { requirePlatformAdmin } from "@/lib/server/auth";
import { listPlatformCurrencies } from "@/lib/server/platform/settings-queries";
import { SETTINGS_PATHS } from "@/modules/settings";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { setCurrencyEnabledAction } from "../../settings-actions";

export default async function Page() {
  await requirePlatformAdmin(SETTINGS_PATHS.currencies);
  const currencies = await listPlatformCurrencies();
  return (
    <main>
      <PageHeader
        eyebrow="Settings"
        title="Currencies"
        description="No FX rates. Decimal semantics stay fixed for currencies with existing financial records."
      />
      <SectionPanel title="Registry">
        <ul className="space-y-3">
          {currencies.map((currency) => (
            <li key={currency.code} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3">
              <div>
                <p className="font-semibold text-navy">
                  {currency.code} · {currency.name}
                </p>
                <p className="text-sm text-muted">{currency.minor_unit_decimals} minor-unit decimals</p>
              </div>
              <form action={setCurrencyEnabledAction}>
                <input type="hidden" name="code" value={currency.code} />
                <input type="hidden" name="enabled" value={currency.enabled ? "false" : "true"} />
                <button type="submit" className="rounded-(--radius-button) border border-line px-3 py-1.5 text-sm font-semibold">
                  {currency.enabled ? "Enabled" : "Disabled"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </SectionPanel>
    </main>
  );
}
