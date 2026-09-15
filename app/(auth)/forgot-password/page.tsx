import Image from "next/image";
import { AUTH_PATHS } from "@/modules/auth";
import { platformConfig } from "@/modules/shared";
import { getVerifiedSession } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage() {
  const session = await getVerifiedSession();
  if (session) {
    redirect(AUTH_PATHS.app);
  }

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
        Forgot password
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        Enter your email address and we will send a password reset link if an
        account exists.
      </p>
      <ForgotPasswordForm />
    </main>
  );
}
