-- Customer INSERT on work_requests uses random_public_id() as a column default.
-- PostgreSQL evaluates defaults as the inserting role, so authenticated must
-- be able to execute this helper. The function only returns a random string;
-- it does not read or write domain rows and takes no identity argument.

grant execute on function public.random_public_id(text) to authenticated;

comment on function public.random_public_id(text) is
  'Public reference generator PREFIX + 12 hex. Authenticated execute is required for work_requests insert defaults. Not a privilege bypass.';
