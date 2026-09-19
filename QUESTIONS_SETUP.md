# 問題管理のSupabase設定

管理者画面から問題を追加・編集・公開・削除し、生徒全員へ配信するには、Supabase SQL Editorで次を1回だけ実行してください。

```sql
create table if not exists public.questions (
  id text primary key,
  unit_id text not null,
  difficulty text not null default 'basic',
  question text not null,
  options jsonb not null default '[]'::jsonb,
  answer_index integer not null default 0,
  explanation text not null default '',
  is_published boolean not null default true,
  is_deleted boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.questions enable row level security;

drop policy if exists "questions_public_read_published" on public.questions;
drop policy if exists "questions_admin_all" on public.questions;

create policy "questions_admin_all"
on public.questions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.get_published_questions()
returns table (
  id text, unit_id text, difficulty text, question text, options jsonb,
  answer_index integer, explanation text, is_published boolean, is_deleted boolean, updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select id, unit_id, difficulty, question, options, answer_index, explanation, is_published, is_deleted, updated_at
  from public.questions
  where is_published = true and is_deleted = false
  order by created_at asc;
$$;

grant execute on function public.get_published_questions() to anon, authenticated;

create or replace function public.get_question_statuses()
returns table (id text, is_published boolean, is_deleted boolean)
language sql
security definer
set search_path = public
as $$
  select id, is_published, is_deleted
  from public.questions;
$$;

grant execute on function public.get_question_statuses() to anon, authenticated;

create index if not exists questions_unit_idx on public.questions(unit_id);
create index if not exists questions_published_idx on public.questions(is_published, is_deleted);
```

## 重要

- ブラウザに入れるのはSupabaseのPublishable Keyだけです。
- Secret / service_role keyは使用しません。
- 既存の120問はサイトに内蔵されています。管理者が既存問題を編集すると、そのIDのクラウド版が優先されます。
- 新しく追加した問題はSupabaseに保存され、公開すると友だち全員のサイトへ反映されます。
- 問題の削除はクラウド側に削除記録を残す方式です。

---

## 第二弾：学習履歴テーブル

管理者画面の「全体の学習分析」や学習者詳細の「定着度の推移」を使う場合は、以下もSQL Editorで一度実行してください。

```sql
create table if not exists public.progress_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  recorded_date date not null,
  mastery numeric not null default 0,
  attempt_count integer not null default 0,
  total_time_seconds integer not null default 0,
  unit_mastery jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, recorded_date)
);

alter table public.progress_history enable row level security;

drop policy if exists "progress_history_admin_read" on public.progress_history;
drop policy if exists "progress_history_student_insert" on public.progress_history;
drop policy if exists "progress_history_student_update" on public.progress_history;

create policy "progress_history_admin_read"
on public.progress_history for select
to authenticated
using (public.is_admin());

create policy "progress_history_student_insert"
on public.progress_history for insert
to authenticated
with check (auth.uid() = user_id);

create policy "progress_history_student_update"
on public.progress_history for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists progress_history_date_idx
on public.progress_history(recorded_date);
```

この履歴は、生徒が学習記録をクラウド同期したときに「1日1件」で更新されます。既存の過去データは自動的には作られず、SQL実行後から履歴が蓄積されます。


## v9.0 最終段階
`FINAL_SETUP.sql` をSQL Editorで実行してください。タグ、管理者作成テスト、テスト結果、学習者向けお知らせのテーブルと公開RPCを追加します。
