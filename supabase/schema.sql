-- =============================================================================
--  Z nami najesz się do syta – baza menu i wydarzeń (Supabase / PostgreSQL)
--
--  Uruchom: Supabase → SQL Editor → New query → wklej cały plik → Run.
--  Skrypt można bezpiecznie uruchamiać wielokrotnie (nic nie kasuje) – także po jego aktualizacji:
--  dopisuje nowe tabele i przenosi istniejące dania na aktualne kategorie.
--  Dalsze kroki (konto klientki, klucze, panel): docs/PANEL-MENU.md
--
--  Bezpieczeństwo: klucz „anon/publishable” jest publiczny, więc dostępu pilnują reguły
--  Row Level Security (RLS) poniżej: każdy może CZYTAĆ menu i wydarzenia, ale ZMIENIAĆ je może
--  tylko osoba z listy `admins` (kto jest na liście – patrz krok 3 w docs/PANEL-MENU.md).
-- =============================================================================

-- 1) Lista osób, które mogą edytować menu i wydarzenia -----------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins_select_own" on public.admins;
create policy "admins_select_own" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

grant select on public.admins to authenticated;

-- 2) Dania (baza dań ze zdjęciami) --------------------------------------------------
create table if not exists public.dishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  category text not null check (category in ('zupy', 'drugie-dania', 'pierogi', 'napoje', 'piwo')),
  price numeric(7, 2) check (price is null or price >= 0),
  description text check (description is null or char_length(description) <= 300),
  photo_path text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- Kategorie zgodne z tablicą w restauracji: zupy, drugie dania, pierogi, napoje, piwo.
-- Starsze kategorie (dania główne/mięsne/bezmięsne, dodatki, sałatki, desery) trafiają do „drugich dań”,
-- a ograniczenie jest zakładane od nowa. Bezpieczne przy ponownym uruchomieniu.
alter table public.dishes drop constraint if exists dishes_category_check;
update public.dishes
   set category = 'drugie-dania'
 where category in ('dania-glowne', 'dania-miesne', 'dania-bezmiesne', 'dodatki', 'salatki', 'desery');
alter table public.dishes
  add constraint dishes_category_check
  check (category in ('zupy', 'drugie-dania', 'pierogi', 'napoje', 'piwo'));

alter table public.dishes enable row level security;

drop policy if exists "dishes_public_read" on public.dishes;
create policy "dishes_public_read" on public.dishes
  for select to anon, authenticated
  using (archived = false);

drop policy if exists "dishes_admin_read_all" on public.dishes;
create policy "dishes_admin_read_all" on public.dishes
  for select to authenticated
  using (public.is_admin());

drop policy if exists "dishes_admin_insert" on public.dishes;
create policy "dishes_admin_insert" on public.dishes
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "dishes_admin_update" on public.dishes;
create policy "dishes_admin_update" on public.dishes
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "dishes_admin_delete" on public.dishes;
create policy "dishes_admin_delete" on public.dishes
  for delete to authenticated
  using (public.is_admin());

grant select on public.dishes to anon;
grant select, insert, update, delete on public.dishes to authenticated;

-- 3) Menu na dany dzień (które dania są danego dnia) --------------------------------
create table if not exists public.daily_menu (
  day date not null,
  dish_id uuid not null references public.dishes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (day, dish_id)
);
create index if not exists daily_menu_dish_id_idx on public.daily_menu (dish_id);
alter table public.daily_menu enable row level security;

drop policy if exists "daily_menu_public_read" on public.daily_menu;
create policy "daily_menu_public_read" on public.daily_menu
  for select to anon, authenticated
  using (true);

drop policy if exists "daily_menu_admin_insert" on public.daily_menu;
create policy "daily_menu_admin_insert" on public.daily_menu
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "daily_menu_admin_update" on public.daily_menu;
create policy "daily_menu_admin_update" on public.daily_menu
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "daily_menu_admin_delete" on public.daily_menu;
create policy "daily_menu_admin_delete" on public.daily_menu
  for delete to authenticated
  using (public.is_admin());

grant select on public.daily_menu to anon;
grant select, insert, update, delete on public.daily_menu to authenticated;

-- 4) Wydarzenia (edytowane w panelu; minione znikają ze strony same) ------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  date date not null,
  end_date date,
  time_label text check (time_label is null or char_length(time_label) <= 40),
  description text not null default '' check (char_length(description) <= 600),
  created_at timestamptz not null default now(),
  constraint events_dates_check check (end_date is null or end_date >= date)
);
create index if not exists events_date_idx on public.events (date);
alter table public.events enable row level security;

drop policy if exists "events_public_read" on public.events;
create policy "events_public_read" on public.events
  for select to anon, authenticated
  using (true);

drop policy if exists "events_admin_insert" on public.events;
create policy "events_admin_insert" on public.events
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "events_admin_update" on public.events;
create policy "events_admin_update" on public.events
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "events_admin_delete" on public.events;
create policy "events_admin_delete" on public.events
  for delete to authenticated
  using (public.is_admin());

grant select on public.events to anon;
grant select, insert, update, delete on public.events to authenticated;

-- 5) Zdjęcia dań (Storage: publiczny odczyt, zapis tylko dla administratora) ---------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dish-photos', 'dish-photos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "dish_photos_public_read" on storage.objects;
create policy "dish_photos_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'dish-photos');

drop policy if exists "dish_photos_admin_insert" on storage.objects;
create policy "dish_photos_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'dish-photos' and public.is_admin());

drop policy if exists "dish_photos_admin_update" on storage.objects;
create policy "dish_photos_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'dish-photos' and public.is_admin())
  with check (bucket_id = 'dish-photos' and public.is_admin());

drop policy if exists "dish_photos_admin_delete" on storage.objects;
create policy "dish_photos_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'dish-photos' and public.is_admin());
