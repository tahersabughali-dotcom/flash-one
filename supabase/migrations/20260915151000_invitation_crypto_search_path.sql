-- pgcrypto (digest / gen_random_bytes) lives in the extensions schema.
-- Invitation SECURITY DEFINER functions used a search_path that omitted it.

alter function public.create_organization_invitation(uuid, text)
  set search_path = pg_catalog, public, extensions;

alter function public.accept_organization_invitation(text)
  set search_path = pg_catalog, public, extensions;
