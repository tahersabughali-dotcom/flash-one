import { MIME_BY_EXTENSION } from "./constants";

const DANGEROUS_EXTENSION =
  /\.(exe|bat|cmd|com|scr|pif|js|mjs|html|htm|svg|php|sh|ps1|vbs|jar|dll|msi|apk|hta)(?:\.|$)/i;

export function extensionOf(filename: string): string | null {
  const match = filename.trim().toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

export function hasDangerousFilename(filename: string): boolean {
  const trimmed = filename.trim();
  if (!trimmed || trimmed.includes("\0")) {
    return true;
  }
  if (trimmed.includes("..") || trimmed.includes("/") || trimmed.includes("\\")) {
    return true;
  }
  return DANGEROUS_EXTENSION.test(trimmed);
}

export function canonicalMimeForFilename(filename: string): string | null {
  if (hasDangerousFilename(filename)) {
    return null;
  }
  const extension = extensionOf(filename);
  if (!extension) {
    return null;
  }
  return MIME_BY_EXTENSION[extension] ?? null;
}
