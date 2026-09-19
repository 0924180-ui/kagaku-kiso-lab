# 化学基礎ラボ v9.0 最終段階

今回の最終版では、管理・出題・学習を一つにつなげています。

## 追加機能
- 管理者の問題追加・編集・削除・公開/非公開
- 問題の検索、単元/公開状態フィルタ
- 問題の複数選択、一括公開/非公開/削除
- 問題CSVエクスポート/インポート
- 問題タグ
- 管理者がオリジナルテストを作成
- テストの問題選択、制限時間、公開/非公開
- 生徒側のテスト受験、タイマー、採点、解説表示
- テスト結果をSupabaseへ保存
- 管理者のお知らせ作成・編集・公開/非公開
- ホーム画面のお知らせ表示
- 既存の学習分析、目標、おすすめ問題、クラウド同期を維持

## Supabase
1. これまでのセットアップSQLを実行済みであることを確認
2. `FINAL_SETUP.sql` をSupabase SQL Editorで1回実行
3. Vercelへデプロイ

## CSV
管理画面の「CSV出力」でテンプレートを作れます。
列は `id, unit_id, difficulty, question, option1, option2, option3, option4, answer_index, explanation, tags, is_published`。
タグは `酸化還元|頻出` のように `|` 区切りです。

## 注意
ブラウザにはPublishable/anon keyだけを使用してください。service_role / Secret keyは絶対に入れません。
Vercel deployment trigger
