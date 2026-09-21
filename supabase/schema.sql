-- =============================================================================
--  Z nami najesz się do syta – baza menu (Supabase / PostgreSQL)
--
--  Uruchom RAZ: Supabase → SQL Editor → New query → wklej cały plik → Run.
--  Skrypt można bezpiecznie uruchomić ponownie (nic nie kasuje).
--  Dalsze kroki (konto klientki, klucze, panel): docs/PANEL-MENU.md
--
--  Bezpieczeństwo: klucz „anon/publishable” jest publiczny, więc dostępu pilnują reguły
--  Row Level Security (RLS) poniżej: każdy może CZYTAĆ menu, ale ZMIENIAĆ je może tylko
--  osoba z listy `admins` (kto jest na liście – patrz krok 5 w docs/PANEL-MENU.md).
-- =============================================================================

-- 1) Lista osób, które mogą edytować menu ------------------------------------------
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
  category text not null check (
    category in ('zupy', 'dania-glowne', 'dania-miesne', 'dania-bezmiesne', 'dodatki', 'salatki', 'desery', 'napoje')
  ),
  price numeric(7, 2) check (price is null or price >= 0),
  description text check (description is null or char_length(description) <= 300),
  photo_path text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
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

-- 4) Zdjęcia dań (Storage: publiczny odczyt, zapis tylko dla administratora) ---------
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
