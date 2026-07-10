# THINGi®︎ × しあわせ360°手帳 30分人材育成課題診断

Life Design Worksの30分人材育成課題診断をWebアプリ化したMVPです。公開フォーム、管理画面、5領域スコア集計、推奨プラン一次判定、AI分析補助、A4レポートのブラウザ印刷PDF出力に対応しています。

## 使用技術

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- React Hook Form
- Zod
- OpenAI API（任意）

## セットアップ手順

```bash
pnpm install
cp .env.example .env
```

`.env` を編集してください。

```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="任意の管理者パスワード"
OPENAI_API_KEY=""
PUBLIC_SITE_HOSTS=""
ADMIN_SITE_HOSTS=""
```

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

## 開発サーバー起動方法

```bash
pnpm dev
```

ブラウザで `http://localhost:3000` を開きます。

## PDF出力方法

管理画面で診断詳細を開き、「顧客レポート生成」からレポート画面へ移動します。「PDF出力」ボタンを押し、ブラウザの印刷画面で「PDFとして保存」を選択してください。

## 管理画面ログイン方法

`/admin/login` を開き、`.env` の `ADMIN_PASSWORD` に設定したパスワードでログインします。管理者ID欄はMVPでは任意入力です。

## 別サイト運用

公開フォームと管理画面を別サイトに分ける場合は、同じアプリを2つのホスト名から参照できるように配置し、`PUBLIC_SITE_HOSTS` と `ADMIN_SITE_HOSTS` を設定してください。

- 公開フォーム：`https://diagnosis.example.com`
- 管理画面：`https://admin.example.com`
- データベース：共通の `DATABASE_URL`

本番で複数サーバー・複数デプロイに分ける場合、SQLiteではなくPostgreSQLなどの共有DBを推奨します。

## 今後追加できる機能

- サーバー側PDF生成API
- 管理者ユーザー管理
- 日程調整ツール連携
- AI分析モデル・プロンプトの管理画面化
- レポートテンプレート複数化
- CSVエクスポート
- メール通知
