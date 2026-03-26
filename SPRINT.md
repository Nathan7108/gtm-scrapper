# GTM Intel — Sprint Plan

**Goal:** Ship a working v1 that scrapes tweets, scores them with Claude, and displays them in a dashboard.

---

## Sprint 1 — Foundation (Issues 1–4)

### Issue 1: Project scaffolding
- Init monorepo structure (`client/`, `server/`, `data/`)
- Set up Vite + React 18 + Tailwind in `client/`
- Set up Express server in `server/`
- Add `concurrently` for single `npm run dev` command
- Create `.env.example` with all required vars
- **Deliverable:** `npm run dev` boots both frontend (5173) and backend (3001)

### Issue 2: Data models & seed files
- Create `data/accounts.json` with the 14 default tracked accounts
- Create `data/topics.json` with the 6 default topic keywords
- Create `data/posts.json` (empty array placeholder)
- Define TypeScript/JSDoc types for Post, Account, Topic
- **Deliverable:** Seed data files committed and importable

### Issue 3: Apify Twitter scraper integration
- Install `apify-client`
- Build `server/scraper.js` — scrape by account handle list
- Build topic-based scrape (keyword search via Apify)
- Add `POST /api/scrape` endpoint to trigger a scrape run
- Add `GET /api/scrape/status` to check run progress
- Deduplicate posts across account + topic scrapes
- Write results to `data/posts.json`
- **Deliverable:** Hit `/api/scrape`, get raw tweets saved to disk

### Issue 4: Claude AI scoring pipeline
- Install `@anthropic-ai/sdk`
- Build `server/scorer.js` — batch score posts via Claude
- Prompt includes Uplinq context, GTM relevance criteria
- Each post gets: score (0–100), tier (High/Mid/Low), one-line insight
- Add `POST /api/score` endpoint to score unscored posts
- Update `data/posts.json` with scores
- **Deliverable:** Raw posts go in, scored posts come out

---

## Sprint 2 — Dashboard UI (Issues 5–8)

### Issue 5: App shell & routing
- Set up React Router (or simple tab nav)
- Build `Sidebar.jsx` with navigation
- Build basic layout (sidebar + main content area)
- **Deliverable:** App shell with working navigation

### Issue 6: Post feed & card components
- Build `PostCard.jsx` — displays tweet text, author, score badge, tier color, insight
- Build `Feed.jsx` — ranked list of scored posts, sorted by score desc
- Filter by tier (High / Mid / All)
- Filter by category / account
- Search posts by keyword
- **Deliverable:** Scored posts render in a filterable feed

### Issue 7: Accounts management panel
- Build `AccountsPanel.jsx`
- Display current tracked accounts from `data/accounts.json`
- Add/remove accounts via UI → `PUT /api/accounts`
- Backend endpoint to update `data/accounts.json`
- **Deliverable:** User can manage tracked accounts from the dashboard

### Issue 8: Topics management panel
- Build `TopicsPanel.jsx`
- Display current topic keywords from `data/topics.json`
- Add/remove topics via UI → `PUT /api/topics`
- Backend endpoint to update `data/topics.json`
- **Deliverable:** User can manage topic filters from the dashboard

---

## Sprint 3 — Digest & Polish (Issues 9–12)

### Issue 9: Email digest
- Install `resend` (or `nodemailer`)
- Build `server/digest.js` — compiles top 5 posts into HTML email
- Add `POST /api/digest` endpoint to send digest on demand
- Build `DigestModal.jsx` — preview + send button in UI
- **Deliverable:** User can generate and send a top-5 email digest

### Issue 10: Scheduled daily scrape
- Add `node-cron` to server
- Schedule daily scrape + score at configurable time
- Auto-send digest email after scoring completes (if configured)
- **Deliverable:** System runs autonomously on a daily schedule

### Issue 11: Supabase persistence (optional)
- Set up Supabase project + tables (posts, accounts, topics)
- Replace JSON file reads/writes with Supabase queries
- Add historical post storage (don't overwrite, append)
- **Deliverable:** Posts persist in a real database with history

### Issue 12: Final polish & deploy
- Error handling on all API routes
- Loading states & empty states in UI
- Mobile-responsive layout
- Deploy frontend (Vercel) + backend (Railway/Render)
- Wire up env vars in production
- **Deliverable:** Live, deployed app accessible via URL

---

## Backlog (Post-MVP)

- Slack notifications for 90+ score posts
- Chrome extension to manually save tweets
- Analytics tab (trending topics, top accounts by signal)
- Multi-user support
- RSS feed output
