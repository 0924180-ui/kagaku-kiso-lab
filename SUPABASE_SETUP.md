# 化学基礎ラボ v7.1：アカウント＋共有進捗設定

この版では、学習者が自分でアカウントを作成し、問題の定着度・問題回答履歴・単元進捗・学習時間をSupabaseへ自動保存します。管理者は `admin.html` から全学習者を確認できます。

## 1. Supabaseプロジェクトを作る

Supabaseで新しいプロジェクトを作成します。

## 2. SQL Editorで以下を一度実行する

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.progress_snapshots (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  mastery numeric not null default 0,
  attempt_count integer not null default 0,
  total_time_seconds integer not null default 0,
  last_study_at timestamptz,
  unit_mastery jsonb not null default '{}'::jsonb,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress_snapshots add column if not exists data jsonb not null default '{}'::jsonb;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name','学習者'), 'student')
  on conflict (id) do update set email=excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.progress_snapshots enable row level security;

drop policy if exists "students read own profile" on public.profiles;
drop policy if exists "students read own progress" on public.progress_snapshots;
drop policy if exists "students insert own progress" on public.progress_snapshots;
drop policy if exists "students update own progress" on public.progress_snapshots;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

create policy "students read own profile" on public.profiles
for select using (id = auth.uid() or public.is_admin());

create policy "students read own progress" on public.progress_snapshots
for select using (user_id = auth.uid() or public.is_admin());

create policy "students insert own progress" on public.progress_snapshots
for insert with check (user_id = auth.uid());

create policy "students update own progress" on public.progress_snapshots
for update using (user_id = auth.uid()) with check (user_id = auth.uid());
```

## 3. 管理者を作る

まず通常の方法で管理者用ユーザーをSupabase Authenticationに作成します。そのユーザーのUUIDを確認し、SQL Editorで次を実行します。

```sql
update public.profiles
set role='admin', display_name='管理者'
where id='管理者ユーザーのUUID';
```

新規登録したユーザーは自動的に `student` として `profiles` に登録されます。

## 4. Supabase接続情報を入れる

`js/supabase-config.js` を開き、Supabaseの Project URL と anon / publishable key を入れます。

```js
window.SUPABASE_URL='https://あなたのプロジェクト.supabase.co';
window.SUPABASE_ANON_KEY='あなたのanon key';
```

**service_role keyは絶対に入れないでください。** ブラウザ側はanon / publishable key＋RLSで権限を守ります。

## 5. Vercelへ公開する

このフォルダをそのままVercelへデプロイします。データベースのURLやanon keyは公開サイトに入りますが、それ自体を秘密情報として扱う必要はありません。代わりにRLSを正しく設定することが重要です。

## 6. 動作確認

1. `auth.html` で生徒アカウントを新規登録
2. ログインして問題を解く
3. 少し待つか別ページへ移動して自動同期させる
4. `admin.html` を管理者アカウントで開く
5. 生徒一覧に学習者が表示される
6. 生徒名をクリックすると単元別定着度・復習優先問題が表示される

既存のLocalStorage記録は、ログイン後にクラウド側のデータがあればクラウドの記録を優先して復元します。初回ログインでクラウド記録がない場合は、現在の端末の記録をそのまま同期します。


## Chromebook向けの簡単設定

この版では `setup.html` を追加しています。サイトをVercelへ公開したあと、`https://あなたのサイト/setup.html` を開き、Project URLとPublishable key / anon keyを入力して保存できます。JSファイルを直接編集する必要はありません。


## Vercelで友だちに配布する設定（v7.5）

Vercelの Project Settings → Environment Variables に次を登録します。

- `SUPABASE_URL` = Supabase Project URL
- `SUPABASE_PUBLISHABLE_KEY` = SupabaseのPublishable key（旧anon keyでも可）

その後、新しいデプロイを実行します。ビルド時に `js/supabase-config.js` が自動生成されるため、友だちは `setup.html` でキーを入力する必要がありません。

**注意:** `SUPABASE_SECRET_KEY`、`service_role` などの秘密キーは絶対に設定しないでください。ブラウザへ配信される構成ではPublishable keyだけを使用します。SupabaseのRLSがアクセス制御を担当します。
