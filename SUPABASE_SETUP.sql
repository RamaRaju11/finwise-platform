-- FinWise Supabase Setup
-- Run this in Supabase Dashboard → SQL Editor → New Query

-- 1. Create profiles table
create table if not exists public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  email           text,
  full_name       text,
  plan            text default 'free' check (plan in ('free','starter','pro','advisor')),
  stripe_customer_id  text,
  plan_expires_at timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.profiles enable row level security;

-- 3. Policies — users can only see/edit their own row
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 4. Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, plan)
  values (new.id, new.email, 'free');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
