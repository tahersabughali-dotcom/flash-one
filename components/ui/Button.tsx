import Link from "next/link";
import { ArrowIcon } from "@/components/ui/icons";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  arrow?: boolean;
  className?: string;
  type?: "button";
  onClick?: () => void;
};

const variants = {
  primary:
    "bg-blue text-white shadow-(--shadow-button) hover:bg-blue-bright",
  secondary:
    "border border-line bg-white/55 text-navy shadow-(--shadow-glass) backdrop-blur-md hover:bg-white/80",
};

export function Button({
  href,
  children,
  variant = "primary",
  arrow = false,
  className = "",
  type = "button",
  onClick,
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-(--radius-button)",
    "px-5 py-2.5 text-sm font-semibold tracking-tight transition-colors",
    variants[variant],
    className,
  ].join(" ");

  const content = (
    <>
      <span>{children}</span>
      {arrow ? <ArrowIcon className="size-3.5" /> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
