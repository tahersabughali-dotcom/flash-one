import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { formatMinor } from "@/modules/invoices/money";
import { formatDisplayDate } from "@/lib/format/display";

const A4: [number, number] = [595.28, 841.89];
const NAVY = rgb(11 / 255, 31 / 255, 58 / 255);
const BLUE = rgb(29 / 255, 78 / 255, 216 / 255);
const MUTED = rgb(90 / 255, 104 / 255, 125 / 255);
const LINE = rgb(226 / 255, 232 / 255, 240 / 255);

export type PdfLine = {
  description: string;
  quantity?: number;
  unitAmountMinor?: number;
  lineTotalMinor: number;
};

async function loadLogo(doc: PDFDocument): Promise<PDFImage | null> {
  try {
    const logoPath = path.join(process.cwd(), "public", "brand", "flash-one-logo.png");
    const bytes = await readFile(logoPath);
    return await doc.embedPng(bytes);
  } catch {
    return null;
  }
}

function drawHeader(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  logo: PDFImage | null,
  title: string,
  reference: string,
) {
  page.drawRectangle({ x: 0, y: 780, width: A4[0], height: 62, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 0, y: 778, width: A4[0], height: 3, color: BLUE });
  if (logo) {
    const scale = 28 / logo.height;
    page.drawImage(logo, {
      x: 40,
      y: 800,
      width: logo.width * scale,
      height: 28,
    });
  }
  page.drawText("Flash One", {
    x: logo ? 40 + 90 : 40,
    y: 812,
    size: 14,
    font: bold,
    color: NAVY,
  });
  page.drawText(title, {
    x: 360,
    y: 818,
    size: 18,
    font: bold,
    color: NAVY,
  });
  page.drawText(reference, {
    x: 360,
    y: 798,
    size: 10,
    font,
    color: MUTED,
  });
}

export async function buildBrandedPdf(input: {
  title: string;
  reference: string;
  subtitle?: string;
  customerLabel?: string;
  dateLabel?: string;
  lines: PdfLine[];
  currency: string;
  subtotalMinor?: number;
  taxMinor?: number;
  totalMinor: number;
  paidMinor?: number;
  dueMinor?: number;
  notes?: string | null;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage(A4);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await loadLogo(doc);
  drawHeader(page, font, bold, logo, input.title, input.reference);

  let y = 750;
  page.drawText("flashone.uk", { x: 40, y, size: 10, font, color: MUTED });
  y -= 18;
  if (input.customerLabel) {
    page.drawText(input.customerLabel, { x: 40, y, size: 12, font: bold, color: NAVY });
    y -= 16;
  }
  if (input.dateLabel) {
    page.drawText(input.dateLabel, { x: 40, y, size: 10, font, color: MUTED });
    y -= 16;
  }
  if (input.subtitle) {
    page.drawText(input.subtitle, { x: 40, y, size: 10, font, color: MUTED });
    y -= 20;
  }

  page.drawRectangle({ x: 40, y: y - 4, width: 515, height: 1, color: LINE });
  y -= 22;
  page.drawText("Description", { x: 40, y, size: 9, font: bold, color: MUTED });
  page.drawText("Amount", { x: 480, y, size: 9, font: bold, color: MUTED });
  y -= 16;

  for (const line of input.lines) {
    const desc = line.description.slice(0, 80);
    page.drawText(desc, { x: 40, y, size: 10, font, color: NAVY });
    if (line.quantity && line.unitAmountMinor !== undefined) {
      page.drawText(
        `${line.quantity} x ${formatMinor(line.unitAmountMinor, input.currency)}`,
        { x: 40, y: y - 12, size: 8, font, color: MUTED },
      );
    }
    page.drawText(formatMinor(line.lineTotalMinor, input.currency), {
      x: 460,
      y,
      size: 10,
      font,
      color: NAVY,
    });
    y -= line.quantity ? 28 : 18;
    if (y < 160) {
      break;
    }
  }

  page.drawRectangle({ x: 40, y: y - 4, width: 515, height: 1, color: LINE });
  y -= 24;
  if (input.subtotalMinor !== undefined) {
    page.drawText(`Subtotal ${formatMinor(input.subtotalMinor, input.currency)}`, {
      x: 360,
      y,
      size: 10,
      font,
      color: NAVY,
    });
    y -= 14;
  }
  if (input.taxMinor !== undefined) {
    page.drawText(`Tax ${formatMinor(input.taxMinor, input.currency)} (not configured)`, {
      x: 360,
      y,
      size: 9,
      font,
      color: MUTED,
    });
    y -= 14;
  }
  page.drawText(`Total ${formatMinor(input.totalMinor, input.currency)}`, {
    x: 360,
    y,
    size: 13,
    font: bold,
    color: NAVY,
  });
  y -= 16;
  if (input.paidMinor !== undefined) {
    page.drawText(`Paid ${formatMinor(input.paidMinor, input.currency)}`, {
      x: 360,
      y,
      size: 10,
      font,
      color: NAVY,
    });
    y -= 14;
  }
  if (input.dueMinor !== undefined) {
    page.drawText(`Amount due ${formatMinor(input.dueMinor, input.currency)}`, {
      x: 360,
      y,
      size: 10,
      font: bold,
      color: BLUE,
    });
    y -= 18;
  }
  if (input.notes) {
    y -= 8;
    page.drawText("Notes", { x: 40, y, size: 9, font: bold, color: MUTED });
    y -= 14;
    page.drawText(input.notes.slice(0, 240), { x: 40, y, size: 9, font, color: NAVY });
  }

  page.drawText("Company registration, VAT, and bank details are omitted until verified.", {
    x: 40,
    y: 48,
    size: 8,
    font,
    color: MUTED,
  });
  page.drawText(`Printed ${formatDisplayDate(new Date().toISOString())}`, {
    x: 40,
    y: 34,
    size: 8,
    font,
    color: MUTED,
  });

  return doc.save();
}

export function pdfResponse(filename: string, bytes: Uint8Array): Response {
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
