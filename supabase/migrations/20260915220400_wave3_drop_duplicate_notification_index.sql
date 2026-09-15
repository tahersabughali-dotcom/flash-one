-- Drop the extra notifications index; recipient_user_id is already indexed.

drop index if exists public.notifications_recipient_created_idx;
