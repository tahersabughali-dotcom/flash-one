import Image from "next/image";
import Link from "next/link";
import { platformConfig } from "@/modules/shared";
import { hasPasswordRecoveryContext } from "@/lib/server/auth";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage() {
  const allowed = await hasPasswordRecoveryContext();

  return (
    <main className="rounded-(--radius-panel) border border-white/70 bg-white/80 p-8 shadow-(--shadow-soft)">
      <Image
        src="/brand/flash-one-logo.png"
        alt="Flash One"
        width={180}
        height={120}
        className="h-10 w-auto object-contain"
      />
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {platformConfig.name}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Reset password
      </h1>
      {allowed ? (
        <>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Choose a new password for your Flash One account.
          </p>
          <ResetPasswordForm />
        </>
      ) : (
        <>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            This reset link is invalid or has expired. Request a new password
            reset to continue.
          </p>
          <p className="mt-8 text-sm text-muted">
            <Link href="/forgot-password" className="font-semibold text-blue">
              Request a new reset link
            </Link>
          </p>
        </>
      )}
    </main>
  );
}
