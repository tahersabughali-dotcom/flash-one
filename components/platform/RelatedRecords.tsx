import { RecordCard } from "./RecordCard";
import { SectionPanel } from "./SectionPanel";
import { StatusBadge } from "./StatusBadge";

export type RelatedRecordItem = {
  href?: string;
  reference?: string;
  title: string;
  meta?: string;
  status?: string;
  statusLabel?: string;
};

export function RelatedRecords({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: RelatedRecordItem[];
}) {
  return (
    <SectionPanel title={title}>
      {items.length === 0 ? (
        <p className="text-[15px] text-muted">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={`${item.reference ?? item.title}-${item.href ?? ""}`}>
              {item.href ? (
                <RecordCard
                  href={item.href}
                  reference={item.reference}
                  title={item.title}
                  meta={item.meta}
                  status={item.status}
                  statusLabel={item.statusLabel}
                />
              ) : (
                <div className="rounded-(--radius-panel) border border-line bg-white px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    {item.reference ? (
                      <p className="text-xs font-semibold tracking-[0.14em] text-navy/50">
                        {item.reference}
                      </p>
                    ) : (
                      <span />
                    )}
                    {item.status && item.statusLabel ? (
                      <StatusBadge status={item.status} label={item.statusLabel} />
                    ) : null}
                  </div>
                  <p className="mt-2 font-extrabold text-navy-deep">{item.title}</p>
                  {item.meta ? <p className="mt-2 text-sm text-muted">{item.meta}</p> : null}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionPanel>
  );
}
