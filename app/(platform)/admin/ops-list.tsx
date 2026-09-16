import Link from "next/link";
import { PageHeader } from "@/components/platform/PageHeader";
import { EmptyState } from "@/components/platform/EmptyState";
import { RecordCard } from "@/components/platform/RecordCard";
import { ListPager } from "@/components/platform/ListPager";

export function OpsList({
  eyebrow,
  title,
  description,
  createHref,
  createLabel,
  emptyTitle,
  emptyDescription,
  page,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  createHref?: string;
  createLabel?: string;
  emptyTitle: string;
  emptyDescription: string;
  page: number;
  items: Array<{ href: string; publicId: string; title: string; status?: string; statusLabel?: string; meta?: string }>;
}) {
  return (
    <main>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          createHref ? (
            <Link href={createHref} className="rounded-(--radius-button) bg-blue px-5 py-2.5 text-sm font-semibold text-white">
              {createLabel ?? "New"}
            </Link>
          ) : null
        }
      />
      {items.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((item) => (
            <li key={item.publicId}>
              <RecordCard
                href={item.href}
                reference={item.publicId}
                title={item.title}
                status={item.status}
                statusLabel={item.statusLabel}
                meta={item.meta}
              />
            </li>
          ))}
        </ul>
      )}
      <ListPager page={page} itemCount={items.length} />
    </main>
  );
}
