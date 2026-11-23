-- Identity site: contact-inbox spam headroom (2026-11-23, mission P-02).
-- Caps site_messages inserts: max 5 per email per hour, max 30 per
-- hour overall. A rejected insert surfaces in the contact form as
-- its honest error state (with the mailto fallback), never a fake
-- success. Applied live via the Supabase dashboard SQL editor and
-- verified with a rolled-back 6-insert transaction (the 6th insert
-- raised "rate limit: too many messages from this email").

create or replace function public.site_messages_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  per_email int;
  total int;
begin
  select count(*) into per_email from public.site_messages
    where lower(email) = lower(new.email) and "createdAt" > (extract(epoch from now()) * 1000 - 3600000);
  if per_email >= 5 then
    raise exception 'rate limit: too many messages from this email';
  end if;
  select count(*) into total from public.site_messages
    where "createdAt" > (extract(epoch from now()) * 1000 - 3600000);
  if total >= 30 then
    raise exception 'rate limit: inbox is busy, try later';
  end if;
  return new;
end;
$$;

drop trigger if exists site_messages_rate_limit on public.site_messages;
create trigger site_messages_rate_limit
  before insert on public.site_messages
  for each row execute function public.site_messages_rate_limit();
