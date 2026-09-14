import { platformConfig } from "@/modules/shared";

export default function PlatformAdminPage() {
  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {platformConfig.name}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Flash One Admin
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Platform foundation is being prepared. This route is an architecture
        placeholder only. It is not an admin console.
      </p>
    </main>
  );
}
