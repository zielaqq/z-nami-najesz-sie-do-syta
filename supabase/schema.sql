-- =============================================================================
--  Z nami najesz się do syta – baza menu, wydarzeń i galerii (Supabase / PostgreSQL)
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
  category text not null check (category in ('obiad-dnia', 'danie-specjalne', 'zupy', 'drugie-dania', 'ryby', 'pierogi', 'napoje', 'piwo')),
  price numeric(7, 2) check (price is null or price >= 0),
  description text check (description is null or char_length(description) <= 300),
  photo_path text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- Kategorie zgodne z tablicą w restauracji: obiad dnia, danie specjalne, zupy, drugie dania, ryby, pierogi, napoje, piwo.
-- Starsze kategorie (dania główne/mięsne/bezmięsne, dodatki, sałatki, desery) trafiają do „drugich dań”,
-- a ograniczenie jest zakładane od nowa. Bezpieczne przy ponownym uruchomieniu.
alter table public.dishes drop constraint if exists dishes_category_check;
update public.dishes
   set category = 'drugie-dania'
 where category in ('dania-glowne', 'dania-miesne', 'dania-bezmiesne', 'dodatki', 'salatki', 'desery');
alter table public.dishes
  add constraint dishes_category_check
  check (category in ('obiad-dnia', 'danie-specjalne', 'zupy', 'drugie-dania', 'ryby', 'pierogi', 'napoje', 'piwo'));

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

-- Kolejność dań na stronie (klientka ustawia ją strzałkami w panelu). Mniejsza liczba = wcześniej.
alter table public.daily_menu add column if not exists sort_order integer not null default 0;

-- Dni zapisane przed dodaniem kolejności dostają kolejność alfabetyczną (tak wyglądały dotąd).
-- Dotyczy tylko dni, w których wszystkie dania mają jeszcze 0, więc ponowne uruchomienie niczego nie zmienia.
update public.daily_menu dm
   set sort_order = ranked.pos
  from (
    select m.day, m.dish_id, (row_number() over (partition by m.day order by d.name) - 1)::integer as pos
      from public.daily_menu m
      join public.dishes d on d.id = m.dish_id
  ) ranked
 where dm.day = ranked.day
   and dm.dish_id = ranked.dish_id
   and dm.day in (select day from public.daily_menu group by day having count(*) > 1 and max(sort_order) = 0);

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

-- 6) Galeria zdjęć (dodawana, kasowana i układana w panelu) --------------------------------
--    `photo_path` to nazwa pliku w magazynie `gallery-photos` albo (gdy zaczyna się od „/”) zdjęcie dołączone do strony
--    (dotychczasowa galeria z kodu – można ją przenieść do panelu przyciskiem w zakładce „Galeria”).
create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  photo_path text not null check (char_length(photo_path) between 1 and 300),
  caption text check (caption is null or char_length(caption) <= 80),
  alt text check (alt is null or char_length(alt) <= 200),
  category text not null check (category in ('wnetrze', 'ogrodek', 'dania')),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  focus text check (focus is null or char_length(focus) <= 20),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists gallery_photos_sort_idx on public.gallery_photos (sort_order);
alter table public.gallery_photos enable row level security;

drop policy if exists "gallery_public_read" on public.gallery_photos;
create policy "gallery_public_read" on public.gallery_photos
  for select to anon, authenticated
  using (true);

drop policy if exists "gallery_admin_insert" on public.gallery_photos;
create policy "gallery_admin_insert" on public.gallery_photos
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "gallery_admin_update" on public.gallery_photos;
create policy "gallery_admin_update" on public.gallery_photos
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "gallery_admin_delete" on public.gallery_photos;
create policy "gallery_admin_delete" on public.gallery_photos
  for delete to authenticated
  using (public.is_admin());

grant select on public.gallery_photos to anon;
grant select, insert, update, delete on public.gallery_photos to authenticated;

-- Magazyn zdjęć galerii (publiczny odczyt, zapis tylko dla administratora, do 5 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery-photos', 'gallery-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "gallery_photos_public_read" on storage.objects;
create policy "gallery_photos_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'gallery-photos');

drop policy if exists "gallery_photos_admin_insert" on storage.objects;
create policy "gallery_photos_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery-photos' and public.is_admin());

drop policy if exists "gallery_photos_admin_update" on storage.objects;
create policy "gallery_photos_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'gallery-photos' and public.is_admin())
  with check (bucket_id = 'gallery-photos' and public.is_admin());

drop policy if exists "gallery_photos_admin_delete" on storage.objects;
create policy "gallery_photos_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery-photos' and public.is_admin());

-- 7) Godziny otwarcia (7 stałych wierszy, jeden na dzień tygodnia; edytowane w panelu) -----
--    `weekday` jak w JS Date#getDay(): 0 = niedziela, 1 = poniedziałek … 6 = sobota.
create table if not exists public.opening_hours (
  weekday smallint primary key check (weekday between 0 and 6),
  is_open boolean not null default true,
  opens text not null default '12:00' check (opens ~ '^([01]\d|2[0-3]):[0-5]\d$'),
  closes text not null default '18:00' check (closes ~ '^([01]\d|2[0-3]):[0-5]\d$')
);

-- Wiersze startowe – zgodne z dotychczasowymi godzinami w kodzie (codziennie 12:00–18:00).
-- Bezpieczne przy ponownym uruchomieniu: istniejące wiersze zostają bez zmian.
insert into public.opening_hours (weekday, is_open, opens, closes)
values (0, true, '12:00', '18:00'),
       (1, true, '12:00', '18:00'),
       (2, true, '12:00', '18:00'),
       (3, true, '12:00', '18:00'),
       (4, true, '12:00', '18:00'),
       (5, true, '12:00', '18:00'),
       (6, true, '12:00', '18:00')
on conflict (weekday) do nothing;

alter table public.opening_hours enable row level security;

drop policy if exists "opening_hours_public_read" on public.opening_hours;
create policy "opening_hours_public_read" on public.opening_hours
  for select to anon, authenticated
  using (true);

drop policy if exists "opening_hours_admin_update" on public.opening_hours;
create policy "opening_hours_admin_update" on public.opening_hours
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.opening_hours to anon;
grant select, update on public.opening_hours to authenticated;

-- 8) Ustawienia strony (jeden wiersz, edytowane w panelu) ----------------------------------
create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  -- Przycisk „Cały tydzień” przy menu na stronie (podgląd pon.–niedz., z jutrem włącznie).
  weekly_menu_visible boolean not null default false
);

insert into public.site_settings (id, weekly_menu_visible)
values (1, false)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
  for select to anon, authenticated
  using (true);

drop policy if exists "site_settings_admin_update" on public.site_settings;
create policy "site_settings_admin_update" on public.site_settings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.site_settings to anon;
grant select, update on public.site_settings to authenticated;
