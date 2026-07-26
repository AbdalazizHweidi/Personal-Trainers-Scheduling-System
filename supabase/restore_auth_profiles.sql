begin;

alter table if exists public.profiles enable row level security;

alter table if exists public.profiles
  alter column role set default 'client';

create policy if not exists "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy if not exists "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    new.email,
    'client'
  )
  on conflict (id) do update
  set full_name = coalesce(public.profiles.full_name, excluded.full_name),
      email = coalesce(public.profiles.email, excluded.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name, email, role)
select
  users.id,
  coalesce(users.raw_user_meta_data ->> 'full_name', split_part(coalesce(users.email, ''), '@', 1)),
  users.email,
  'client'
from auth.users as users
left join public.profiles as profiles on profiles.id = users.id
where profiles.id is null;

commit;