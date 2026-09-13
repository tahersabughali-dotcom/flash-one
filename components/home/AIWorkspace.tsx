import { aiWorkspace } from "@/data/ai";
import { ArrowIcon } from "@/components/ui/icons";

export function AIWorkspace() {
  return (
    <div
      className="overflow-hidden rounded-(--radius-panel) border border-white/80 bg-white/80 shadow-(--shadow-soft) backdrop-blur-xl"
      aria-hidden="true"
    >
      <div className="flex min-h-[24rem] lg:min-h-[28rem]">
        <aside className="hidden w-[10.5rem] shrink-0 border-r border-line/70 bg-white/50 p-4 sm:block">
          <p className="text-sm font-extrabold tracking-tight text-navy-deep">
            {aiWorkspace.brand}
          </p>
          <ul className="mt-5 space-y-1.5">
            {aiWorkspace.sidebar.map((item, index) => (
              <li
                key={item}
                className={[
                  "rounded-2xl px-3 py-2 text-[13px] font-medium",
                  index === 0
                    ? "bg-blue/10 text-navy"
                    : "text-navy/60",
                ].join(" ")}
              >
                {item}
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <p className="text-sm font-semibold text-navy/70">
            {aiWorkspace.brand}
          </p>

          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <h3 className="text-2xl leading-tight font-extrabold tracking-[-0.03em] text-navy-deep sm:text-[1.85rem]">
              {aiWorkspace.heading}
            </h3>
            <div className="mt-6 grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
              {aiWorkspace.actions.map((action) => (
                <div
                  key={action}
                  className="rounded-2xl border border-line bg-page-soft/80 px-3 py-4 text-sm font-semibold text-navy"
                >
                  {action}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-line bg-white/90 px-4 py-2.5">
            <span className="min-w-0 flex-1 text-left text-sm text-muted">
              {aiWorkspace.inputLabel}
            </span>
            <span className="flex size-9 items-center justify-center rounded-full bg-blue text-white">
              <ArrowIcon className="size-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
