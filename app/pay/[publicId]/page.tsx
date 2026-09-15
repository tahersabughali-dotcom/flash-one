import { notFound } from "next/navigation";
import { formatMinor } from "@/modules/invoices";
import { PAYMENT_SERVICE_LABELS, type PaymentServiceCode } from "@/modules/payment-requests";
import { getPublicPaymentRequest, listCheckoutProviders } from "@/lib/server/payments/core";
import { CheckoutForm } from "../checkout-form";

export default async function PayRequestPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  if (!/^PRQ-[A-F0-9]{12}$/.test(publicId)) {
    notFound();
  }
  const request = await getPublicPaymentRequest(publicId);
  if (!request) {
    notFound();
  }
  const status = String(request.status ?? "");
  if (status === "not_found") {
    notFound();
  }
  if (status !== "active" && status !== "completed") {
    return (
      <main>
        <h1 className="text-3xl font-extrabold text-navy-deep">This payment link is not available.</h1>
        <p className="mt-4 text-[15px] text-muted">
          It may have expired or been cancelled.
        </p>
      </main>
    );
  }
  if (status === "completed") {
    return (
      <main>
        <h1 className="text-3xl font-extrabold text-navy-deep">This payment is complete.</h1>
      </main>
    );
  }
  const providers = await listCheckoutProviders();
  const eligible = providers.filter(
    (provider) => !provider.businessOnly || request.business_only_eligible === true,
  );
  const serviceCode = request.service_code as PaymentServiceCode | null;
  const amountMinor =
    typeof request.requested_amount_minor === "number"
      ? request.requested_amount_minor
      : Number(request.requested_amount_minor ?? 0);
  return (
    <main>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy/50">
        {String(request.public_id)}
      </p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-navy-deep">
        {request.amount_mode === "fixed" && amountMinor
          ? formatMinor(amountMinor, String(request.currency ?? "GBP"))
          : "Enter an amount"}
      </h1>
      {serviceCode && serviceCode in PAYMENT_SERVICE_LABELS ? (
        <p className="mt-3 text-[15px] text-muted">{PAYMENT_SERVICE_LABELS[serviceCode]}</p>
      ) : null}
      {typeof request.description === "string" && request.description ? (
        <p className="mt-2 text-[15px] text-muted">{request.description}</p>
      ) : null}
      <CheckoutForm
        requestPublicId={publicId}
        amountMode={String(request.amount_mode ?? "fixed")}
        guest={request.guest === true}
        providers={eligible}
      />
    </main>
  );
}
