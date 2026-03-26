# GTM Intel — Personalized GTM Intelligence Feed

A modern React app that scrapes Twitter/X accounts and topics, scores content for GTM relevance using Claude AI, and surfaces the highest-signal posts in a clean dashboard. Built for Uplinq's growth and sales team.

---

## What This Does

- Scrapes tweets from a curated list of GTM, growth, sales, AI, and startup accounts
- Scrapes posts by topic keywords (GTM, AI tools, B2B Sales, Growth, PLG, Startup)
- Scores every post 0–100 for relevance using Claude AI
- Surfaces top posts in a ranked, filterable dashboard
- Generates a daily email digest of the top 5 posts
- Fully configurable — add/remove accounts and topics anytime

---

## Tech Stack

- **Frontend** — React 18, Vite, Tailwind CSS
- **Scraping** — Apify Twitter Scraper (via Apify API)
- **AI Scoring** — Claude via local proxy (Claude Max) or Ollama (free local LLM)
- **Backend** — Node.js / Express (scrape runner + scoring endpoint)
- **Email Digest** — Nodemailer or Resend API
- **Storage** — Local JSON or Supabase (optional)

---

## Project Structure

```
gtm-intel/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Feed.jsx         # Main post feed
│   │   │   ├── PostCard.jsx     # Individual post card with score
│   │   │   ├── AccountsPanel.jsx # Manage tracked accounts
│   │   │   ├── TopicsPanel.jsx  # Manage topic filters
│   │   │   ├── DigestModal.jsx  # Email digest generator
│   │   │   └── Sidebar.jsx      # Navigation
│   │   ├── App.jsx
│   │   └── main.jsx
├── server/                  # Node backend
│   ├── scraper.js           # Apify Twitter scraper runner
│   ├── scorer.js            # Claude AI relevance scoring
│   ├── digest.js            # Email digest builder
│   └── index.js             # Express server
├── data/
│   ├── accounts.json        # Tracked Twitter accounts
│   ├── topics.json          # Topic keywords
│   └── posts.json           # Cached scored posts
├── .env.example
├── package.json
└── README.md
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Nathan7108/gtm-scrapper.git
cd gtm-scrapper
```

### 2. Install dependencies

```bash
npm install
cd client && npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```env
APIFY_API_TOKEN=your_apify_token_here
ANTHROPIC_API_KEY=your_claude_api_key_here
RESEND_API_KEY=your_resend_key_here        # optional, for email digest
DIGEST_EMAIL=you@email.com                  # where to send digests
```

### 4. Run the app

```bash
# Run backend + frontend together
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:3001`

---

## How the Scoring Works

Each post is sent to Claude with the following context:

- Uplinq is an AI-powered bookkeeping and tax platform for SMBs
- The GTM team needs signal on: outbound strategy, AI automation, PLG, SMB sales, growth tactics, and competitor moves
- Claude scores each post 0–100 and returns a one-line insight specific to Uplinq

Posts scoring 85+ are marked **High**, 65–84 are **Mid**, below 65 are filtered out by default.

---

## Tracked Accounts (Default)

| Handle | Name | Category |
|---|---|---|
| @codyschneiderxx | Cody Schneider | GTM |
| @jasonlk | Jason Lemkin | SaaS |
| @samblond | Sam Blond | Sales |
| @kyle_poyar | Kyle Poyar | PLG |
| @gregisenberg | Greg Isenberg | GTM |
| @austinbelcak | Austin Belcak | Growth |
| @sama | Sam Altman | AI |
| @karpathy | Andrej Karpathy | AI |
| @paulg | Paul Graham | Startup |
| @naval | Naval | Startup |
| @aaronross | Aaron Ross | Sales |
| @justinwelsh | Justin Welsh | Growth |
| @alexhormozi | Alex Hormozi | Growth |
| @nickabrahams | Nick Abrahams | Sales |

---

## Default Topic Keywords

- GTM / go-to-market
- AI tools & automation
- B2B Sales & outreach
- Growth marketing
- Startup & founder content
- Product led growth (PLG)

---

## Roadmap

- [ ] Apify scraper integration
- [ ] Claude scoring pipeline
- [ ] React dashboard (feed, accounts, topics)
- [ ] Email digest via Resend
- [ ] Supabase storage for post history
- [ ] Scheduled daily scrape (cron)
- [ ] Slack notification for top posts
- [ ] Chrome extension to save tweets manually
- [ ] Analytics tab (trending topics, top accounts by signal)

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `APIFY_API_TOKEN` | Yes | Apify API key for Twitter scraping |
| `ANTHROPIC_API_KEY` | Yes | Claude API key for scoring |
| `RESEND_API_KEY` | No | Resend API key for email digest |
| `DIGEST_EMAIL` | No | Email address for daily digest |

---

## Contributing

This is an internal tool built for Uplinq's GTM team. PRs welcome for new features or account suggestions.

---

Built by Nathan Luckock
