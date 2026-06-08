# 🌿 Verdure — 体重管理 & AI食事アドバイス

体重・食事・トレーニング・睡眠を毎日記録し、**Claude API による食事アドバイス**を受け取れる、ブラウザ完結型の体重管理アプリです。データはお使いのブラウザ（LocalStorage）にのみ保存され、APIキーはサーバー側でのみ扱うため安全です。

![tech](https://img.shields.io/badge/Vite-React-16a34a) ![api](https://img.shields.io/badge/Claude%20API-Vercel%20Functions-0f7a38)

## ✨ 主な機能

- **記録機能** — 日付ごとに体重 / 食事 / トレーニング / 睡眠を入力。変更は **LocalStorage に自動保存**。
- **AI食事アドバイス** — 入力した食事（朝・昼・おやつ・夜）から、Claude が
  - カロリー評価
  - 栄養バランスの改善点
  - 次の食事におすすめの食材
  - 体重管理目標へのアドバイス
  を生成します。
- **AIトレーニングアドバイス** — 実施した筋トレ・運動内容から、Claude が
  - 強度・ボリューム評価
  - 鍛えられた主な部位
  - フォーム・頻度などの改善ポイント
  - 次におすすめの種目
  - 目標に向けたアドバイス
  を生成します。
- **ダッシュボード** — 過去30日の体重推移グラフ（自前SVG・軽量）と、現在体重 / 変化量 / 平均体重の統計。
- **履歴** — 過去の記録を一覧・再編集・削除。

## 🏗 技術構成

| 領域 | 採用技術 |
| --- | --- |
| フロントエンド | Vite + React（バニラ寄り、外部UIライブラリ無し） |
| バックエンド | Vercel Functions（サーバーレス, `/api/meal-advice`・`/api/training-advice`） |
| AI | Claude API（`claude-sonnet-4-6`） |
| 保存 | ブラウザの LocalStorage |
| グラフ | 依存ライブラリ無しの自前 SVG チャート |

APIキー（`ANTHROPIC_API_KEY`）は **サーバーレス関数の環境変数としてのみ** 使用し、フロントエンドのバンドルには一切含めません。

## 🚀 ローカルでの起動

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を開き、[Anthropic Console](https://console.anthropic.com/) で発行した APIキーを設定します。

```env
ANTHROPIC_API_KEY=sk-ant-...
```

### 3-A. UI だけを確認する（フロントのみ）

```bash
npm run dev
```

→ http://localhost:5173 で表示されます。記録・グラフ・履歴はすべて動作します。
（この方法では `/api` が立ち上がらないため、AIアドバイスは次の 3-B か、本番デプロイ後にご利用ください。）

### 3-B. AIアドバイスも含めてフルに動かす（推奨）

Vercel CLI を使うと、フロントと `/api` 関数を同時にローカル起動できます。

```bash
npm i -g vercel      # 未インストールの場合
vercel dev
```

→ 案内されるURL（通常 http://localhost:3000 ）で、AIアドバイスを含む全機能が動作します。

> 💡 5173 の dev サーバから本番の関数を叩いて検証したい場合は、`.env.local` に
> `VITE_API_BASE=https://your-app.vercel.app` を設定してください。

## 🪄 Node なしで今すぐ開く（standalone.html）

Node.js を入れずに UI を試したい場合は、ビルド済みの単一ファイル **`standalone.html`** をブラウザで開くだけで動きます（記録・グラフ・履歴・LocalStorage 保存はすべて動作。AI食事アドバイスのみバックエンドが必要）。

```bash
# 方法1: ダブルクリック、または
open standalone.html      # file:// で開く

# 方法2: ローカルHTTPサーバ（Python標準機能のみ）
python3 -m http.server 4399
#  → http://localhost:4399/standalone.html
```

`standalone.html` は `python3 build-standalone.py` で再生成できます（`src/index.css` とアプリ本体を結合）。

## ☁️ Vercel へのデプロイ

1. リポジトリを GitHub などに push。
2. [Vercel](https://vercel.com/) で **New Project** → 該当リポジトリを Import。
3. Framework Preset は自動で **Vite** が選択されます（`vercel.json` 済み）。
4. **Settings → Environment Variables** に以下を追加：

   | Name | Value |
   | --- | --- |
   | `ANTHROPIC_API_KEY` | `sk-ant-...` |

5. **Deploy** を実行。`/api/meal-advice` が同一オリジンで自動的に有効になります。

CLI から直接デプロイする場合：

```bash
vercel            # プレビュー環境
vercel --prod     # 本番環境
# 環境変数の登録:
vercel env add ANTHROPIC_API_KEY
```

## 📁 構成

```
weight-tracker/
├─ api/
│  ├─ meal-advice.js      # Vercel Function（食事アドバイス）
│  └─ training-advice.js  # Vercel Function（トレーニングアドバイス）
├─ src/
│  ├─ components/
│  │  ├─ RecordForm.jsx     # 記録入力フォーム
│  │  ├─ Dashboard.jsx      # 統計 + グラフ
│  │  ├─ WeightChart.jsx    # 自前SVG折れ線グラフ
│  │  ├─ MealAdvice.jsx     # AI食事アドバイス UI
│  │  └─ TrainingAdvice.jsx # AIトレーニングアドバイス UI
│  ├─ lib/
│  │  ├─ storage.js       # LocalStorage 入出力
│  │  └─ api.js           # /api クライアント
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css           # デザインシステム
├─ build-standalone.py    # standalone.html を生成
├─ standalone.html        # Node不要の単一ファイル版（生成物）
├─ .env.example           # サーバー環境変数の雛形
├─ .env.local.example     # ローカル開発用の雛形
├─ vercel.json
└─ vite.config.js
```

## 🔒 プライバシー

- 体重・食事などの記録は **ブラウザのLocalStorageにのみ** 保存され、サーバーには送信されません。
- AIアドバイスを依頼したときのみ、その食事テキストがサーバーレス関数を経由して Claude API に送られます。

---

Made with 🌿 — Vite × React × Claude
