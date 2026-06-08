# 🌿 Verdure — 体重管理

体重・食事・トレーニング・睡眠を毎日記録し、推移をグラフで振り返れる、ブラウザ完結型のシンプルな体重管理アプリです。データはお使いのブラウザ（LocalStorage）にのみ保存されます。サーバーや外部APIは使わないため、**運用コストは一切かかりません**。

![tech](https://img.shields.io/badge/Vite-React-16a34a)

## ✨ 主な機能

- **記録機能** — 日付ごとに体重 / 食事（朝・昼・おやつ・夜）/ トレーニング / 睡眠を入力。変更は **LocalStorage に自動保存**。
- **ダッシュボード** — 過去30日の体重推移グラフ（自前SVG・軽量）と、現在体重 / 変化量 / 平均体重の統計。
- **履歴** — 過去の記録を一覧・再編集・削除。同じ日に何度でも追記・修正可能。
- **データの管理** — 記録を JSON で書き出し／読み込み。別端末への移行やバックアップに使えます（ファイルを移すだけ・無料・アカウント不要）。

## 🏗 技術構成

| 領域 | 採用技術 |
| --- | --- |
| フレームワーク | Vite + React（バニラ寄り、外部UIライブラリ無し） |
| 保存 | ブラウザの LocalStorage（サーバー送信なし） |
| グラフ | 依存ライブラリ無しの自前 SVG チャート |

完全な静的サイトです。バックエンド・データベース・APIキーは不要です。

## 🚀 ローカルでの起動

```bash
npm install
npm run dev          # → http://localhost:5173
```

ビルドする場合：

```bash
npm run build        # dist/ に静的ファイルを出力
npm run preview      # ビルド結果をプレビュー
```

## 🪄 Node なしで今すぐ開く（standalone.html）

Node.js を入れずに使いたい場合は、ビルド済みの単一ファイル **`standalone.html`** をブラウザで開くだけで、全機能（記録・グラフ・履歴・LocalStorage保存）が動作します。

```bash
# 方法1: ダブルクリック、または
open standalone.html      # file:// で開く

# 方法2: ローカルHTTPサーバ（Python標準機能のみ）
python3 -m http.server 4399
#  → http://localhost:4399/standalone.html
```

`standalone.html` は `python3 build-standalone.py` で再生成できます（`src/index.css` とアプリ本体を結合）。

## ☁️ Vercel へのデプロイ

完全な静的サイトなので、環境変数の設定は不要です。

1. リポジトリを GitHub などに push。
2. [Vercel](https://vercel.com/) で **New Project** → 該当リポジトリを Import。
3. Framework Preset は自動で **Vite** が選択されます（`vercel.json` 済み）。
4. **Deploy** を実行。

→ `https://<プロジェクト名>.vercel.app` が発行されます。Vercel の Hobby プラン（個人利用は無料）で運用できます。

## 📁 構成

```
weight-tracker/
├─ src/
│  ├─ components/
│  │  ├─ RecordForm.jsx   # 記録入力フォーム
│  │  ├─ Dashboard.jsx    # 統計 + グラフ
│  │  └─ WeightChart.jsx  # 自前SVG折れ線グラフ
│  ├─ lib/
│  │  └─ storage.js       # LocalStorage 入出力
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css           # デザインシステム
├─ build-standalone.py    # standalone.html を生成
├─ standalone.html        # Node不要の単一ファイル版（生成物）
├─ vercel.json
└─ vite.config.js
```

## 🔒 プライバシー

- 体重・食事などの記録は **ブラウザの LocalStorage にのみ** 保存され、サーバーには一切送信されません。
- 外部サービスへの通信は行いません（フォント読み込みを除く）。

---

Made with 🌿 — Vite × React
