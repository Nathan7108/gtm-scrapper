const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const { runScrape } = require('./scraper')
const { runScore } = require('./scorer')
const { sendDigest } = require('./digest')
const { startScheduler, stopScheduler, getSchedulerStatus } = require('./scheduler')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const dataDir = path.join(__dirname, '..', 'data')

function readJSON(file) {
  const filePath = path.join(dataDir, file)
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJSON(file, data) {
  fs.writeFileSync(path.join(dataDir, file), JSON.stringify(data, null, 2))
}

// --- Routes ---

app.get('/api/posts', (req, res) => {
  res.json(readJSON('posts.json'))
})

app.get('/api/accounts', (req, res) => {
  res.json(readJSON('accounts.json'))
})

app.put('/api/accounts', (req, res) => {
  writeJSON('accounts.json', req.body)
  res.json({ ok: true })
})

app.get('/api/topics', (req, res) => {
  res.json(readJSON('topics.json'))
})

app.put('/api/topics', (req, res) => {
  writeJSON('topics.json', req.body)
  res.json({ ok: true })
})

// Scrape endpoint (Issue 3)
let scrapeInProgress = false

app.post('/api/scrape', async (req, res) => {
  if (scrapeInProgress) {
    return res.status(409).json({ status: 'busy', message: 'A scrape is already in progress' })
  }

  const { accounts = true, topics = true, maxTweetsPerSource = 20 } = req.body || {}

  scrapeInProgress = true
  try {
    const result = await runScrape({ accounts, topics, maxTweetsPerSource })
    res.json(result)
  } catch (err) {
    console.error('[Server] Scrape failed:', err.message)
    res.status(500).json({ status: 'error', message: err.message })
  } finally {
    scrapeInProgress = false
  }
})

// Score endpoint (Issue 4)
let scoreInProgress = false

app.post('/api/score', async (req, res) => {
  if (scoreInProgress) {
    return res.status(409).json({ status: 'busy', message: 'Scoring is already in progress' })
  }

  const { batchSize = 10 } = req.body || {}

  scoreInProgress = true
  try {
    const result = await runScore({ batchSize })
    res.json(result)
  } catch (err) {
    console.error('[Server] Score failed:', err.message)
    res.status(500).json({ status: 'error', message: err.message })
  } finally {
    scoreInProgress = false
  }
})

// Digest endpoint (Issue 9)
app.post('/api/digest', async (req, res) => {
  const { topN = 5, preview = false } = req.body || {}
  try {
    const result = await sendDigest({ topN, preview })
    res.json(result)
  } catch (err) {
    console.error('[Server] Digest failed:', err.message)
    res.status(500).json({ status: 'error', message: err.message })
  }
})

// Scheduler endpoints (Issue 10)
app.post('/api/scheduler/start', (req, res) => {
  const { cron: cronExpr = '0 8 * * *' } = req.body || {}
  startScheduler(cronExpr)
  res.json({ status: 'started', cron: cronExpr })
})

app.post('/api/scheduler/stop', (req, res) => {
  stopScheduler()
  res.json({ status: 'stopped' })
})

app.get('/api/scheduler/status', (req, res) => {
  res.json(getSchedulerStatus())
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Global error handler
app.use((err, req, res, _next) => {
  console.error('[Server] Unhandled error:', err.message)
  res.status(500).json({ status: 'error', message: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`[GTM Intel] Server running on http://localhost:${PORT}`)

  // Auto-start scheduler (scraper works in guest mode, no key needed)
  if (process.env.AUTO_SCHEDULE !== 'false') {
    startScheduler()
  }
})
