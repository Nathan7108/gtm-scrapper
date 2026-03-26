const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '..', 'data')

function readJSON(file) {
  const filePath = path.join(dataDir, file)
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function writeJSON(file, data) {
  fs.writeFileSync(path.join(dataDir, file), JSON.stringify(data, null, 2))
}

const SCORING_PROMPT = `You are a GTM intelligence analyst for Uplinq, an AI-powered bookkeeping and tax platform for SMBs.

Score the following tweet for relevance to Uplinq's GTM team. Consider:
- Outbound sales strategies and tactics
- AI automation tools for sales/marketing
- Product-led growth (PLG) patterns
- SMB sales and go-to-market insights
- Growth marketing tactics
- Competitor moves in fintech/accounting/AI
- B2B SaaS growth strategies
- Founder/startup insights applicable to Uplinq's stage

Respond with ONLY valid JSON (no markdown, no code fences):
{"score": <0-100>, "tier": "<HIGH|MID|LOW>", "insight": "<one sentence insight specific to Uplinq>"}

Scoring guide:
- 85-100 (HIGH): Directly actionable for Uplinq's GTM — specific tactics, competitor intel, or strategic insights
- 65-84 (MID): Relevant context — industry trends, general GTM wisdom applicable to Uplinq
- 0-64 (LOW): Tangential or not relevant to Uplinq's GTM motion

Tweet by @HANDLE:
"TEXT"`

async function callOllama(prompt) {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL || 'llama3.1:8b'

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: 'json'
    })
  })

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.response
}

async function callClaudeProxy(prompt) {
  const proxyUrl = process.env.CLAUDE_PROXY_URL || 'http://localhost:4171'
  const proxyKey = process.env.CLAUDE_PROXY_KEY || 'local-dev'

  const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${proxyKey}`
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200
    })
  })

  if (!response.ok) {
    throw new Error(`Claude proxy error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callLLM(prompt) {
  const provider = process.env.LLM_PROVIDER || 'ollama'

  if (provider === 'claude-proxy') {
    return callClaudeProxy(prompt)
  }
  return callOllama(prompt)
}

function parseScoreResponse(raw) {
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)

    const score = Math.max(0, Math.min(100, parseInt(parsed.score, 10) || 0))
    let tier = String(parsed.tier || '').toUpperCase()
    if (!['HIGH', 'MID', 'LOW'].includes(tier)) {
      tier = score >= 85 ? 'HIGH' : score >= 65 ? 'MID' : 'LOW'
    }

    return {
      score,
      tier,
      insight: String(parsed.insight || 'No insight generated')
    }
  } catch {
    console.error('[Scorer] Failed to parse LLM response:', raw)
    return null
  }
}

async function scorePost(post) {
  const prompt = SCORING_PROMPT
    .replace('HANDLE', post.handle || 'unknown')
    .replace('TEXT', post.text || '')

  const rawResponse = await callLLM(prompt)
  return parseScoreResponse(rawResponse)
}

async function runScore({ batchSize = 10 } = {}) {
  const posts = readJSON('posts.json')
  const unscored = posts.filter(p => p.score === null || p.score === undefined)

  if (unscored.length === 0) {
    return {
      status: 'completed',
      scored: 0,
      total: posts.length,
      message: 'No unscored posts found',
      timestamp: new Date().toISOString()
    }
  }

  console.log(`[Scorer] Scoring ${Math.min(unscored.length, batchSize)} of ${unscored.length} unscored posts`)

  const toScore = unscored.slice(0, batchSize)
  let scored = 0
  const errors = []

  for (const post of toScore) {
    try {
      const result = await scorePost(post)
      if (result) {
        post.score = result.score
        post.tier = result.tier
        post.insight = result.insight
        post.scoredAt = new Date().toISOString()
        scored++
        console.log(`[Scorer] @${post.handle}: ${result.score} (${result.tier})`)
      }
    } catch (err) {
      console.error(`[Scorer] Error scoring post ${post.id}:`, err.message)
      errors.push({ postId: post.id, error: err.message })
    }
  }

  writeJSON('posts.json', posts)

  const result = {
    status: 'completed',
    scored,
    remaining: unscored.length - scored,
    total: posts.length,
    provider: process.env.LLM_PROVIDER || 'ollama',
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString()
  }

  console.log(`[Scorer] Done: ${scored} posts scored, ${result.remaining} remaining`)
  return result
}

module.exports = { runScore }
