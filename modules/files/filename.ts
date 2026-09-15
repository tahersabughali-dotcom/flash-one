import { MIME_BY_EXTENSION } from "./constants";

export function extensionOf(filename: string): string | null {
  const match = filename.trim().toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? null;
}

export function canonicalMimeForFilename(filename: string): string | null {
  const extension = extensionOf(filename);
  if (!extension) {
    return null;
  }
  return MIME_BY_EXTENSION[extension] ?? null;
}
