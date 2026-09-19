-- 化学基礎ラボ v9.0 最終段階
-- v8.0/v8.2 の QUESTIONS_SETUP.md / progress_history が済んでいる前提

alter table public.questions add column if not exists tags jsonb not null default '[]'::jsonb;

-- 公開問題RPCにもタグを含める


create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  question_ids jsonb not null default '[]'::jsonb,
  time_limit_seconds integer not null default 0,
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references public.tests(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  score integer not null default 0,
  total integer not null default 0,
  time_seconds integer not null default 0,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  is_published boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tests enable row level security;
alter table public.test_results enable row level security;
alter table public.announcements enable row level security;

-- 管理者のみ tests / announcements を編集可能
 drop policy if exists "tests_admin_all" on public.tests;
create policy "tests_admin_all" on public.tests for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "test_results_student_insert" on public.test_results;
create policy "test_results_student_insert" on public.test_results for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "test_results_student_read" on public.test_results;
create policy "test_results_student_read" on public.test_results for select to authenticated using (user_id = auth.uid() or public.is_admin());

 drop policy if exists "announcements_admin_all" on public.announcements;
create policy "announcements_admin_all" on public.announcements for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.get_published_tests()
returns table (id uuid, title text, description text, question_ids jsonb, time_limit_seconds integer, updated_at timestamptz)
language sql security definer set search_path=public as $$
 select id,title,description,question_ids,time_limit_seconds,updated_at from public.tests where is_published=true order by created_at desc;
$$;
grant execute on function public.get_published_tests() to anon, authenticated;

create or replace function public.get_published_announcements()
returns table (id uuid, title text, body text, created_at timestamptz)
language sql security definer set search_path=public as $$
 select id,title,body,created_at from public.announcements where is_published=true order by created_at desc limit 10;
$$;
grant execute on function public.get_published_announcements() to anon, authenticated;

create index if not exists tests_published_idx on public.tests(is_published);
create index if not exists test_results_user_idx on public.test_results(user_id,submitted_at desc);
create index if not exists announcements_published_idx on public.announcements(is_published,created_at desc);

drop function if exists public.get_published_questions();
create function public.get_published_questions()
returns table (
  id text, unit_id text, difficulty text, question text, options jsonb,
  answer_index integer, explanation text, tags jsonb, is_published boolean, is_deleted boolean, updated_at timestamptz
)
language sql security definer set search_path=public as $$
  select id,unit_id,difficulty,question,options,answer_index,explanation,tags,is_published,is_deleted,updated_at
  from public.questions where is_published=true and is_deleted=false order by created_at asc;
$$;
grant execute on function public.get_published_questions() to anon, authenticated;
