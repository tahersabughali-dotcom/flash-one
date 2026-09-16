function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EmailTemplateCode =
  | "account_recovery"
  | "quote_issued"
  | "invoice_issued"
  | "receipt_available"
  | "project_update"
  | "case_update";

export type EmailTemplateInput = {
  recipientName?: string | null;
  reference?: string | null;
  title?: string | null;
  summary?: string | null;
  actionUrl?: string | null;
};

export type RenderedEmail = {
  code: EmailTemplateCode;
  subject: string;
  text: string;
  html: string;
};

const BRAND = "Flash One";
const SITE = "www.flashone.uk";

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>${escapeHtml(BRAND)}</title></head>
<body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0b1f3a;background:#f7f9fc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
    <tr><td style="padding:24px 28px;border-bottom:3px solid #1d4ed8;">
      <p style="margin:0;font-size:18px;font-weight:700;">${escapeHtml(BRAND)}</p>
      <p style="margin:6px 0 0;font-size:12px;color:#5a687d;">${escapeHtml(SITE)}</p>
    </td></tr>
    <tr><td style="padding:28px;">${body}</td></tr>
    <tr><td style="padding:16px 28px 24px;font-size:11px;color:#5a687d;">
      Company registration, VAT, and contact details are omitted until verified.<br />
      This message was prepared by Flash One. Delivery requires a configured email provider.
    </td></tr>
  </table>
</body>
</html>`;
}

function wrapText(lines: string[]): string {
  return [
    BRAND,
    SITE,
    "",
    ...lines,
    "",
    "Company registration, VAT, and contact details are omitted until verified.",
    "Delivery requires a configured email provider.",
  ].join("\n");
}

export function listEmailTemplateCodes(): EmailTemplateCode[] {
  return [
    "account_recovery",
    "quote_issued",
    "invoice_issued",
    "receipt_available",
    "project_update",
    "case_update",
  ];
}

export function renderEmailTemplate(
  code: EmailTemplateCode,
  input: EmailTemplateInput = {},
): RenderedEmail {
  const name = (input.recipientName || "there").trim() || "there";
  const reference = (input.reference || "").trim();
  const title = (input.title || "").trim();
  const summary = (input.summary || "").trim();
  const actionUrl = (input.actionUrl || "").trim();

  const safeName = escapeHtml(name);
  const safeRef = escapeHtml(reference);
  const safeTitle = escapeHtml(title);
  const safeSummary = escapeHtml(summary);
  const safeUrl = escapeHtml(actionUrl);

  switch (code) {
    case "account_recovery": {
      const subject = `${BRAND} account recovery`;
      const text = wrapText([
        `Hello ${name},`,
        "",
        "Use your recovery link to reset your password.",
        actionUrl ? actionUrl : "Recovery link is provided by the auth provider when email is configured.",
        "",
        "If you did not request this, you can ignore this message.",
      ]);
      const html = wrapHtml(`
        <p>Hello ${safeName},</p>
        <p>Use your recovery link to reset your password.</p>
        ${
          actionUrl
            ? `<p><a href="${safeUrl}">Continue recovery</a></p>`
            : `<p>Recovery link is provided by the auth provider when email is configured.</p>`
        }
        <p style="color:#5a687d;font-size:13px;">If you did not request this, you can ignore this message.</p>
      `);
      return { code, subject, text, html };
    }
    case "quote_issued": {
      const subject = reference ? `Quote ${reference} is ready` : "Your quote is ready";
      const text = wrapText([
        `Hello ${name},`,
        "",
        "A quote is available in your Flash One workspace.",
        reference ? `Reference: ${reference}` : "",
        summary || "",
        actionUrl || "",
      ].filter(Boolean));
      const html = wrapHtml(`
        <p>Hello ${safeName},</p>
        <p>A quote is available in your Flash One workspace.</p>
        ${safeRef ? `<p><strong>Reference:</strong> ${safeRef}</p>` : ""}
        ${safeSummary ? `<p>${safeSummary}</p>` : ""}
        ${actionUrl ? `<p><a href="${safeUrl}">View quote</a></p>` : ""}
      `);
      return { code, subject, text, html };
    }
    case "invoice_issued": {
      const subject = reference ? `Invoice ${reference}` : "Invoice issued";
      const text = wrapText([
        `Hello ${name},`,
        "",
        "An invoice is available in your Flash One workspace.",
        reference ? `Reference: ${reference}` : "",
        summary || "",
        actionUrl || "",
      ].filter(Boolean));
      const html = wrapHtml(`
        <p>Hello ${safeName},</p>
        <p>An invoice is available in your Flash One workspace.</p>
        ${safeRef ? `<p><strong>Reference:</strong> ${safeRef}</p>` : ""}
        ${safeSummary ? `<p>${safeSummary}</p>` : ""}
        ${actionUrl ? `<p><a href="${safeUrl}">View invoice</a></p>` : ""}
      `);
      return { code, subject, text, html };
    }
    case "receipt_available": {
      const subject = reference ? `Receipt ${reference}` : "Receipt available";
      const text = wrapText([
        `Hello ${name},`,
        "",
        "A receipt is available for a confirmed payment.",
        reference ? `Reference: ${reference}` : "",
        actionUrl || "",
      ].filter(Boolean));
      const html = wrapHtml(`
        <p>Hello ${safeName},</p>
        <p>A receipt is available for a confirmed payment.</p>
        ${safeRef ? `<p><strong>Reference:</strong> ${safeRef}</p>` : ""}
        ${actionUrl ? `<p><a href="${safeUrl}">View receipt</a></p>` : ""}
      `);
      return { code, subject, text, html };
    }
    case "project_update": {
      const subject = title ? `Project update: ${title}` : "Project update";
      const text = wrapText([
        `Hello ${name},`,
        "",
        "There is a project update in your Flash One workspace.",
        reference ? `Project: ${reference}` : "",
        title || "",
        summary || "",
        actionUrl || "",
      ].filter(Boolean));
      const html = wrapHtml(`
        <p>Hello ${safeName},</p>
        <p>There is a project update in your Flash One workspace.</p>
        ${safeRef ? `<p><strong>Project:</strong> ${safeRef}</p>` : ""}
        ${safeTitle ? `<p><strong>${safeTitle}</strong></p>` : ""}
        ${safeSummary ? `<p>${safeSummary}</p>` : ""}
        ${actionUrl ? `<p><a href="${safeUrl}">Open project</a></p>` : ""}
      `);
      return { code, subject, text, html };
    }
    case "case_update": {
      const subject = reference ? `Case ${reference} update` : "Support case update";
      const text = wrapText([
        `Hello ${name},`,
        "",
        "There is an update on your support case.",
        reference ? `Case: ${reference}` : "",
        summary || "",
        actionUrl || "",
      ].filter(Boolean));
      const html = wrapHtml(`
        <p>Hello ${safeName},</p>
        <p>There is an update on your support case.</p>
        ${safeRef ? `<p><strong>Case:</strong> ${safeRef}</p>` : ""}
        ${safeSummary ? `<p>${safeSummary}</p>` : ""}
        ${actionUrl ? `<p><a href="${safeUrl}">View case</a></p>` : ""}
      `);
      return { code, subject, text, html };
    }
    default: {
      const _exhaustive: never = code;
      return _exhaustive;
    }
  }
}
