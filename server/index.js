const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const { runScrape } = require('./scraper')
const { runScore } = require('./scorer')

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`[GTM Intel] Server running on http://localhost:${PORT}`)
})
