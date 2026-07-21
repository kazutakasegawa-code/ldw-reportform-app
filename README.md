# 採用・定着・育成課題 5分診断

Life Design Worksの「採用・定着・育成課題 5分診断」をWebアプリ化したMVPです。採用手法や求人活動ではなく、採用後に社員が定着し、育ち、チームで成果を出せる職場環境・育成状態を確認します。公開フォーム、診断結果ページ、レーダーチャート、30分面談＋AI詳細診断CTA、管理画面、AI分析補助、A4レポートのブラウザ印刷PDF出力に対応しています。

## 使用技術

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL（Supabase / Neon等）
- React Hook Form
- Zod
- Recharts
- OpenAI API（任意）

## セットアップ手順

```bash
pnpm install
cp .env.example .env
```

`.env` を編集してください。

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
ADMIN_PASSWORD="任意の管理者パスワード"
OPENAI_API_KEY=""
PUBLIC_SITE_HOSTS=""
ADMIN_SITE_HOSTS=""
```

`DATABASE_URL` と `DIRECT_URL` はSupabaseまたはNeonで発行されるPostgreSQL接続URLを設定します。Supabaseを使う場合、`DATABASE_URL` にはプーリング用URL、`DIRECT_URL` には直接接続URLを設定してください。

`OPENAI_API_KEY` を設定すると、管理画面の「AI分析実行」ボタンからOpenAI APIへ接続し、AI分析結果を項目別に生成・保存できます。未設定の場合は、AI分析用プロンプトをコピーして手動で利用できます。

`PUBLIC_SITE_HOSTS` と `ADMIN_SITE_HOSTS` を設定すると、公開フォーム用サイトと管理者用サイトを別ドメイン・別サブドメインで運用できます。未設定の場合は、従来通り同じサイト内の `/diagnosis` と `/admin` で動作します。

例：

```env
PUBLIC_SITE_HOSTS="diagnosis.example.com"
ADMIN_SITE_HOSTS="admin.example.com"
```

この場合、公開サイトでは `/admin` と `/api/admin` へアクセスできません。管理者サイトのトップ `/` は `/admin` に転送されます。どちらのサイトも同じ `DATABASE_URL` を使うため、診断フォームの送信内容は管理画面に連動します。

## DB初期化手順

```bash
pnpm db:push
```

Vercel本番環境では、環境変数を設定したうえでデプロイしてください。初回はローカルから接続先DBに対して `pnpm db:push` を実行するか、Vercelのデプロイ前にDBスキーマを反映してください。

## 開発サーバー起動方法

```bash
pnpm dev
```

ブラウザで `http://localhost:3000` を開きます。

## PDF出力方法

5分診断結果ページでは簡易結果をブラウザ印刷できます。詳細なAI分析レポートは、管理画面で診断詳細を開き、「顧客レポート生成」からレポート画面へ移動します。「PDF出力」ボタンを押し、ブラウザの印刷画面で「PDFとして保存」を選択してください。

## 管理画面ログイン方法

`/admin/login` を開き、`.env` の `ADMIN_PASSWORD` に設定したパスワードでログインします。管理者ID欄はMVPでは任意入力です。

## 別サイト運用

公開フォームと管理画面を別サイトに分ける場合は、同じアプリを2つのホスト名から参照できるように配置し、`PUBLIC_SITE_HOSTS` と `ADMIN_SITE_HOSTS` を設定してください。

- 公開フォーム：`https://diagnosis.example.com`
- 管理画面：`https://admin.example.com`
- データベース：共通の `DATABASE_URL`

本番で複数サーバー・複数デプロイに分ける場合、SQLiteではなくPostgreSQLなどの共有DBを推奨します。

## Vercel公開手順

1. GitHubにこのリポジトリをpushします。
2. Vercelで `Add New Project` を選び、GitHubの `ldw-reportform-app` を接続します。
3. Framework Presetは `Next.js` を選択します。
4. Environment Variablesに以下を設定します。
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `ADMIN_PASSWORD`
   - `OPENAI_API_KEY`（任意）
   - `PUBLIC_SITE_HOSTS`（任意）
   - `ADMIN_SITE_HOSTS`（任意）
5. Deployを実行します。
6. 公開後、`https://公開URL/diagnosis` が診断フォーム、`https://公開URL/admin` が管理画面になります。
7. 診断送信後は、ランダムな結果URL `/diagnosis/result/[resultToken]` に遷移します。

## 今後追加できる機能

- サーバー側PDF生成API
- 管理者ユーザー管理
- 日程調整ツール連携
- AI分析モデル・プロンプトの管理画面化
- レポートテンプレート複数化
- CSVエクスポート
- メール通知
