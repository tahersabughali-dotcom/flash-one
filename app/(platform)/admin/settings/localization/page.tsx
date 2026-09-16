import { requirePlatformAdmin } from "@/lib/server/auth";
import {
  listPlatformCountries,
  listPlatformLanguages,
} from "@/lib/server/platform/settings-queries";
import { SETTINGS_PATHS } from "@/modules/settings";
import { PageHeader } from "@/components/platform/PageHeader";
import { SectionPanel } from "@/components/platform/SectionPanel";
import { StatusBadge } from "@/components/platform/StatusBadge";
import { setCountryEnabledAction, setLanguageEnabledAction } from "../../settings-actions";

export default async function Page() {
  await requirePlatformAdmin(SETTINGS_PATHS.localization);
  const [languages, countries] = await Promise.all([
    listPlatformLanguages(),
    listPlatformCountries(),
  ]);
  return (
    <main>
      <PageHeader
        eyebrow="Settings"
        title="Localization"
        description="English remains the public default. Arabic is prepared for future platform localization. Enabled countries do not claim Flash One has an office there."
      />
      <SectionPanel title="Languages">
        <ul className="space-y-3">
          {languages.map((language) => (
            <li key={language.code} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3">
              <div>
                <p className="font-semibold text-navy">
                  {language.display_name} ({language.code}) · {language.direction.toUpperCase()}
                </p>
                <StatusBadge
                  status={language.enabled ? "enabled" : "disabled"}
                  label={language.enabled ? "Enabled" : "Disabled"}
                />
              </div>
              <form action={setLanguageEnabledAction}>
                <input type="hidden" name="code" value={language.code} />
                <input type="hidden" name="enabled" value={language.enabled ? "false" : "true"} />
                <button
                  type="submit"
                  disabled={language.code === "en"}
                  className="rounded-(--radius-button) border border-line px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
                >
                  {language.code === "en" ? "Default" : language.enabled ? "Disable" : "Enable"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </SectionPanel>
      <SectionPanel title="Countries">
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {countries.map((country) => (
            <li key={country.code} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm">
              <span>
                {country.display_name} ({country.code})
                {country.region ? ` · ${country.region}` : ""}
              </span>
              <form action={setCountryEnabledAction}>
                <input type="hidden" name="code" value={country.code} />
                <input type="hidden" name="enabled" value={country.enabled ? "false" : "true"} />
                <button type="submit" className="text-xs font-semibold text-blue">
                  {country.enabled ? "Enabled" : "Disabled"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </SectionPanel>
    </main>
  );
}
