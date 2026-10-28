-- Public visitors now inquire through WhatsApp; only the admin creates bookings.
-- Apply this migration to the Supabase project when deploying the redesign.
begin;

revoke insert on table public.reservations from anon;

-- Cover every existing overload of the former public booking RPC.
do $$
declare
  booking_rpc regprocedure;
begin
  for booking_rpc in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'create_public_reservation'
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', booking_rpc);
  end loop;
end;
$$;

create or replace function public.enforce_reservation_advance()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.event_date < (current_timestamp at time zone 'America/Montevideo')::date + 10 then
      raise exception 'Las reservas deben coordinarse con al menos 10 días de anticipación.';
    end if;
  elsif new.event_date is distinct from old.event_date then
    if new.event_date < (current_timestamp at time zone 'America/Montevideo')::date + 10 then
      raise exception 'La nueva fecha debe tener al menos 10 días de anticipación.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_reservation_advance on public.reservations;
create trigger enforce_reservation_advance
before insert or update of event_date on public.reservations
for each row execute function public.enforce_reservation_advance();

commit;
