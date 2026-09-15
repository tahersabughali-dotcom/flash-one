import { GuestPayForm } from "./guest-pay-form";

export default function PayPage() {
  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        Flash One
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        Make a payment
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted">
        Enter an amount and a service, then choose a payment method. You do not need an account.
      </p>
      <GuestPayForm />
    </main>
  );
}
