-- Admin bookings allow individually negotiated guest counts.
-- Public budget inquiry limits remain in the public form.
begin;

do $$
declare
  item record;
  original text;
  revised text;
begin
  -- Preserve all other checks, authorization and booking conflict logic.
  for item in
    select p.oid from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('create_admin_reservation_v2', 'update_admin_reservation_v2')
  loop
    original := pg_get_functiondef(item.oid);
    revised := regexp_replace(original, '(\mp_children_count\M\s*>\s*)30\M', '\12147483647', 'gi');
    revised := regexp_replace(revised, '(\mp_adults_count\M\s*>\s*)50\M', '\12147483647', 'gi');
    revised := regexp_replace(revised, '(\mp_children_count\M\s+between\s+0\s+and\s+)30\M', '\12147483647', 'gi');
    revised := regexp_replace(revised, '(\mp_adults_count\M\s+between\s+0\s+and\s+)50\M', '\12147483647', 'gi');
    if revised <> original then execute revised; end if;
  end loop;

  for item in
    select conname, pg_get_constraintdef(oid) as definition
    from pg_constraint
    where conrelid = 'public.reservations'::regclass and contype = 'c'
  loop
    revised := regexp_replace(item.definition, '(\mchildren_count\M\s*<=\s*)30\M', '\12147483647', 'gi');
    revised := regexp_replace(revised, '(\madults_count\M\s*<=\s*)50\M', '\12147483647', 'gi');
    if revised <> item.definition then
      execute format('alter table public.reservations drop constraint %I', item.conname);
      execute format('alter table public.reservations add constraint %I %s', item.conname, revised);
    end if;
  end loop;
end;
$$;

commit;
