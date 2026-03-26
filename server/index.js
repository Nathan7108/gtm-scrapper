const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

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

// Placeholder scrape endpoint (Issue 3)
app.post('/api/scrape', (req, res) => {
  res.json({ status: 'not_implemented', message: 'Apify scraper coming in Issue 3' })
})

// Placeholder score endpoint (Issue 4)
app.post('/api/score', (req, res) => {
  res.json({ status: 'not_implemented', message: 'LLM scoring coming in Issue 4' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`[GTM Intel] Server running on http://localhost:${PORT}`)
})
