# SRS Quiz App (Kanji/Word Spaced Repetition)

MERN + TypeScript, single-user, personal practice app.

## Structure
- `/client` — React + TypeScript (Vite)
- `/server` — Express + TypeScript

## Step 1 status (this commit)
- Basic Express server with a `/api/health` route.
- Basic React app that fetches `/api/health` and displays the result.
- Vite dev server proxies `/api/*` requests to the Express server on port 5000.

## Running locally

### 1. Start the backend
```
cd server
cp .env.example .env
npm install
npm run dev
```
Server runs on http://localhost:5050

> **Note (macOS):** Port 5000 is used by AirPlay Receiver on macOS, so this
> project defaults to 5050 instead to avoid conflicts. If 5050 is ever busy
> too, just change `PORT` in `server/.env`.

### 2. Start the frontend
```
cd client
npm install
npm run dev
```
Frontend runs on http://localhost:5173 (default Vite port) and will show
"Backend status: Server is running" once both are up.

## Next steps (planned)
1. ✅ Project setup (this step)
2. MongoDB connection + Word model (with SRS fields)
3. Add-word UI (1 correct + 3 incorrect options)
4. Review queue logic (SM-2 spaced repetition scheduling)
5. Review session UI (quiz screen)
6. Session controls (quit/stop, score display)
7. Polish (stats, styling)
