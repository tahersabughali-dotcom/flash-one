/**
 * Server-only database environment.
 *
 * Returns null when variables are absent so Next.js build does not fail.
 * Do not import from Client Components.
 * Do not prefix these names with NEXT_PUBLIC_.
 */

export type ServerDatabaseConfig = {
  url: string;
  publishableKey: string;
};

function readNonEmpty(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function getServerDatabaseConfig(): ServerDatabaseConfig | null {
  const url = readNonEmpty("SUPABASE_URL");
  const publishableKey = readNonEmpty("SUPABASE_PUBLISHABLE_KEY");

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}
