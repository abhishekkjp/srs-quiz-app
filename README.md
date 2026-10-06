# 漢字ノート — Japanese Kanji & Vocabulary Spaced Repetition App

A full-stack spaced repetition system (SRS) for studying Japanese kanji and vocabulary, built from scratch with the MERN stack and TypeScript end-to-end. Implements the SM-2 scheduling algorithm (the same algorithm family behind Anki) to decide what you should review and when, based on how well you actually remember it.

**Live app:** [your-app.vercel.app](https://srs-quiz-app-edr5.vercel.app/)
**API:** [your-api.onrender.com/api/health](https://your-api.onrender.com/api/health)

<details>
<summary><strong>日本語で見る / View in Japanese</strong></summary>

<br>

# 漢字ノート — 日本語の漢字・単語スペースド・リピティション学習アプリ

MERN スタック + TypeScript をフルスタックで使用して構築した、日本語の漢字・単語を学習するためのスペースド・リピティション・システム(SRS)です。SM-2 スケジューリングアルゴリズム(Anki と同系統のアルゴリズム)を実装しており、実際にどれだけ覚えているかに基づいて、次に復習すべきタイミングを決定します。

**アプリ本体:** [your-app.vercel.app](https://your-app.vercel.app) *(実際の URL に置き換えてください)*
**API:** [your-api.onrender.com/api/health](https://your-api.onrender.com/api/health) *(実際の URL に置き換えてください)*

---

### このアプリを作った理由

単語カードアプリは雑に作ろうと思えばいくらでも雑に作れます ― 何を覚えているかの記憶を一切持たない、ただのシャッフルされたカードの山になりがちです。本当に面白いエンジニアリング上の課題は「スケジューラー」の設計、つまり各単語について「そろそろ忘れそうだから復習すべきタイミング」を正確に判断することです。本プロジェクトでは、固定の復習間隔でごまかすのではなく、この部分をきちんと実装しています。

---

### 主な機能

- **SM-2 によるスペースド・リピティション・スケジューリング** ― 各単語は、自分自身の「易しさ係数(ease factor)」「復習間隔(interval)」「連続正解数(repetitions)」を保持します。正解すれば間隔が伸び(1日 → 6日 → 17日 → 49日 …)、不正解になるとリセットされ、翌日にまた出題されます。
- **セッション設定が可能な復習モード** ― 単語数指定(例: 20問)または時間指定(例: 10分、カウントダウン付きで時間切れ時は自動終了)でセッションを開始できます。
- **セッション内でのキュー管理** ― 正解した単語はそのセッションのキューから外れ、不正解だった単語はセッション終了前に再度出題されるようキューの最後尾に戻されます(他の復習対象の単語には影響しません)。
- **リアルタイム&最終スコア表示** ― セッション中は正解/不正解数をリアルタイムで表示し、終了時(または途中終了時)にサマリーを表示します。
- **単語の自由登録** ― 任意の漢字・単語を、正解の意味1つと誤答の選択肢3つとともに UI から追加でき、フロントエンド・バックエンド双方でバリデーションを行います。
- **1,100語の初期データセット** ― 実在するライセンス済みの JLPT 語彙データと、JMDict 由来の英語訳辞書を突き合わせて作成しています。マイナーな N1 語彙ではなく、N5/N4 の頻出語彙を中心に構成しています。誤答の選択肢もすべて同じデータセット内の実在する意味から生成しているため、不自然な誤答にはなりません。
- **フロントエンドからバックエンドまで型安全** ― `Word` や `SessionConfig` などのデータ構造はクライアント・サーバー間で TypeScript の型として共有されており、スキーマ変更があれば実行時エラーではなくコンパイルエラーとして検出されます。

---

### 技術スタック

| レイヤー | 採用技術 | 採用理由 |
|---|---|---|
| フロントエンド | React + TypeScript (Vite) | 高速な開発サーバー、ネイティブ ESM、TypeScript との高い親和性 |
| バックエンド | Node.js + Express + TypeScript | 最小限で明示的なルーティング。フレームワークの「魔法」に悩まされない |
| データベース | MongoDB (Atlas, 無料プラン) | 単語データはドキュメント指向と相性が良く、複雑な JOIN を伴うリレーショナル設計が不要 |
| ODM | Mongoose | ルートハンドラだけでなく、モデル層でもスキーマバリデーションを実施 |
| ホスティング | Vercel(フロントエンド)+ Render(バックエンド) | 個人規模のプロジェクトに適した、無料かつ git push だけで自動デプロイされる構成 |

---

### スケジューリングアルゴリズムについて

各単語は、内容とは独立した4つのスケジューリング用フィールドを持っています。

```ts
easeFactor: number;      // 単語の「覚えやすさ」係数。初期値は 2.5
interval: number;        // 次回復習までの日数
repetitions: number;     // 連続正解数
nextReviewDate: Date;    // この単語が再び「復習対象」になる日時
```

回答のたびに `calculateNextReview()`(`server/src/utils/srs.ts`)が、正解/不正解の2値を SM-2 の品質スケール(正解=5、不正解=2)にマッピングし、上記4つのフィールドを再計算します。復習セッションに出題されるのは `nextReviewDate <= 現在時刻` を満たす単語のみです ― つまり、デッキ全体をランダムに出すのではなく、「本当に忘れかけているもの」を常に優先して出題します。

---

### デプロイ構成

| サービス | 役割 | プラン |
|---|---|---|
| [Render](https://render.com) | Express API | 無料(15分間アクセスがないとスリープ) |
| [Vercel](https://vercel.com) | React フロントエンド | 無料 |
| [MongoDB Atlas](https://mongodb.com/atlas) | データベース | 無料(M0) |

いずれも `main` ブランチへの push で自動デプロイされます。

---

### デザインについて

UI は、よくあるテンプレート的な SaaS デザイン(カード+ドロップシャドウの多用、定番のダークモード・グラデーションなど)をあえて避けています。見出しと漢字表示には日本語組版向けに設計されたセリフ体「Shippori Mincho」、本文・UI 部分には「Zen Kaku Gothic New」を採用しました ― これは装飾目的ではなく、アプリの実際のコンテンツが日本語の文字そのものであることに基づいた選択です。配色も、既定のアクセントカラーではなく、伝統的な「藍染め」の藍色を基調にしています。

</details>




---

## Why this exists

Flashcard apps are easy to build badly: a shuffled deck with no memory of what you actually know. The interesting engineering problem is the scheduler — deciding, per word, exactly when it's about to fall out of memory and should resurface. This project implements that properly rather than faking it with a fixed review interval.

---

## Features

- **Spaced repetition scheduling (SM-2)** — each word tracks its own ease factor, interval, and repetition count. Get it right, the interval grows (1 → 6 → 17 → 49 days...). Get it wrong, it resets and resurfaces tomorrow.
- **Configurable review sessions** — start a session by word count (e.g. 20 words) or by time box (e.g. 10 minutes), with a live countdown and auto-submit on expiry.
- **Session-aware queueing** — a word answered correctly drops out of the queue for that session; a word answered incorrectly is requeued to resurface again before the session ends, without affecting other due words.
- **Live and final scoring** — running correct/incorrect tally during the session, summary on completion or early quit.
- **Custom word authoring** — add any kanji or vocabulary word from the UI with one correct meaning and three distractor options, validated both client- and server-side.
- **1,100-word starter dataset** — seeded from a real, licensed JLPT vocabulary corpus (cross-referenced against a JMDict-derived meanings dictionary), weighted toward common N5/N4 vocabulary rather than obscure entries. Distractor options are drawn from genuine meanings elsewhere in the dataset, so wrong answers are always plausible, never nonsense.
- **Typed end-to-end** — shared data shapes (`Word`, `SessionConfig`) are mirrored between client and server as TypeScript interfaces, so a schema change surfaces as a compile error, not a runtime bug.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript (Vite) | Fast dev server, native ESM, first-class TS support |
| Backend | Node.js + Express + TypeScript | Minimal, explicit routing; no framework magic to debug through |
| Database | MongoDB (Atlas, free tier) | Words are naturally document-shaped; no join-heavy relational modeling needed |
| ODM | Mongoose | Schema validation at the model layer, not just at the route handler |
| Hosting | Vercel (frontend) + Render (backend) | Zero-cost, git-push-to-deploy pipeline suitable for a solo/personal-scale project |

---

## Architecture

\```
┌─────────────────┐       HTTPS        ┌──────────────────┐       Mongoose       ┌─────────────┐
│  React (Vite)    │ ──────────────────▶│  Express API       │ ───────────────────▶│  MongoDB     │
│  Vercel           │◀────────────────── │  Render             │◀─────────────────── │  Atlas       │
└─────────────────┘      JSON            └──────────────────┘                        └─────────────┘
\```

- In development, Vite's dev server proxies `/api/*` to the local Express server — no CORS configuration needed locally.
- In production, the frontend calls the deployed API directly via an injected `VITE_API_URL` build-time environment variable; the backend's CORS policy is locked to the deployed frontend's origin via `CLIENT_ORIGIN`.

---

## The scheduling algorithm

Every word carries four scheduling fields, maintained independently of its content:

\```ts
easeFactor: number;      // how "easy" this word is — starts at 2.5
interval: number;        // days until the next review
repetitions: number;     // consecutive correct answers
nextReviewDate: Date;    // when this word re-enters the due queue
\```

On each answer, `calculateNextReview()` (`server/src/utils/srs.ts`) maps the binary correct/incorrect signal onto the SM-2 quality scale (5 for correct, 2 for incorrect) and recomputes all four fields. A word is only pulled into a review session once `nextReviewDate <= now` — so the app always surfaces exactly what's at risk of being forgotten, not an arbitrary shuffle of the whole deck.

---

## Project structure

\```
srs-quiz-app/
├── client/                      # React + TypeScript (Vite)
│   └── src/
│       ├── api/                 # typed fetch wrappers (words.ts, config.ts)
│       ├── components/          # AddWordForm, QuizSession, SessionSetup
│       ├── types/                # shared Word / SessionConfig interfaces
│       ├── index.css             # design system (tokens, components)
│       └── App.tsx
│
└── server/                       # Express + TypeScript
    └── src/
        ├── models/Word.ts         # Mongoose schema incl. SRS fields
        ├── routes/words.ts        # REST endpoints
        ├── utils/srs.ts           # SM-2 scheduling logic
        ├── seedData.json          # 1,100-word starter dataset
        ├── seed.ts                 # idempotent DB seed script
        ├── db.ts                   # MongoDB connection
        └── index.ts                 # app entrypoint
\```

---

## API reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/words` | List all words |
| `POST` | `/api/words` | Create a word (`term`, `correctMeaning`, `incorrectOptions[3]`, `type`) |
| `GET` | `/api/words/due` | List words currently due for review |
| `POST` | `/api/words/:id/review` | Submit an answer (`correct: boolean`); updates SRS schedule |

---

## Running locally

**Prerequisites:** Node.js 18+, a MongoDB Atlas connection string (free tier is sufficient).

\```bash
# Backend
cd server
cp .env.example .env     # fill in MONGO_URI
npm install
npm run dev               # http://localhost:5050

# Frontend (separate terminal)
cd client
npm install
npm run dev                # http://localhost:5173
\```

To load the starter dataset:
\```bash
cd server
npm run seed                # safe to re-run — skips words that already exist
\```

### Environment variables

**`server/.env`**
| Variable | Description |
|---|---|
| `PORT` | Backend port (default `5050`; `5000` is avoided deliberately — it conflicts with macOS AirPlay Receiver) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `CLIENT_ORIGIN` | Deployed frontend origin, for CORS (production only) |

**`client`** (Vercel environment variable)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Deployed backend URL (e.g. `https://your-api.onrender.com`) |

---

## Deployment

| Service | Role | Tier |
|---|---|---|
| [Render](https://render.com) | Express API | Free (cold-starts after 15 min idle) |
| [Vercel](https://vercel.com) | React frontend | Free |
| [MongoDB Atlas](https://mongodb.com/atlas) | Database | Free (M0) |

Both deploy automatically on push to `main`.

---

## Design notes

The UI deliberately avoids generic SaaS defaults (card-and-shadow kits, templated dark-mode gradients). Typography pairs **Shippori Mincho** (a serif designed for Japanese text) for headings and kanji display with **Zen Kaku Gothic New** for body/UI text — chosen specifically because the app's actual content is Japanese script, not for decoration. The palette draws from *aizome* (traditional indigo dye) rather than a default accent color.

---

## Roadmap

- [ ] Stats dashboard (retention rate, streaks, review history over time)
- [ ] Edit/delete existing words from the UI
- [ ] Bulk CSV import for custom word lists
- [ ] Audio playback for readings

---

## License

Personal project, built for private study use. JLPT vocabulary dataset sourced under MIT license from [AnchorI/jlpt-kanji-dictionary](https://github.com/AnchorI/jlpt-kanji-dictionary) and [Bluskyo/JLPT_Vocabulary](https://github.com/Bluskyo/JLPT_Vocabulary).