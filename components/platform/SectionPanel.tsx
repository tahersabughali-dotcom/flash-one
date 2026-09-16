export function SectionPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-(--radius-panel) border border-white/70 bg-white/80 p-5 shadow-(--shadow-soft) sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy/50">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
