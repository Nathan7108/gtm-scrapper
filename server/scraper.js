const { Scraper, SearchMode } = require('@the-convocation/twitter-scraper')
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

async function createClient() {
  const scraper = new Scraper()
  const username = process.env.TWITTER_USERNAME
  const password = process.env.TWITTER_PASSWORD

  if (username && password) {
    console.log(`[Scraper] Logging in as @${username}...`)
    await scraper.login(username, password)
    console.log('[Scraper] Logged in — search enabled')
  } else {
    console.log('[Scraper] No credentials — using guest mode (account scraping only, no keyword search)')
  }

  return scraper
}

function normalizeTweet(raw, source, sourceValue) {
  const handle = raw.username || 'unknown'
  const tweetId = raw.id || String(Date.now())

  return {
    id: `${handle}_${tweetId}`,
    tweetId,
    text: raw.text || '',
    author: raw.name || 'Unknown',
    handle,
    avatar: raw.avatar || null,
    date: raw.timeParsed?.toISOString() || raw.timestamp?.toString() || new Date().toISOString(),
    likes: raw.likes || 0,
    retweets: raw.retweets || 0,
    replies: raw.replies || 0,
    url: raw.permanentUrl || `https://x.com/${handle}/status/${tweetId}`,
    source,
    sourceValue,
    score: null,
    tier: null,
    insight: null,
    category: null,
    scrapedAt: new Date().toISOString()
  }
}

async function scrapeByAccount(scraper, handle, maxTweets) {
  console.log(`[Scraper] Scraping @${handle} (max ${maxTweets})`)

  const tweets = []
  const iterator = scraper.getTweets(handle, maxTweets)

  for await (const tweet of iterator) {
    if (tweets.length >= maxTweets) break
    if (tweet.text) tweets.push(tweet)
  }

  const normalized = tweets.map(t => normalizeTweet(t, 'account', handle))
  const filtered = normalized.filter(isWorthKeeping)
  console.log(`[Scraper] Got ${tweets.length} tweets from @${handle}, ${filtered.length} passed quality filter`)
  return filtered
}

async function scrapeByTopic(scraper, keyword, maxTweets) {
  console.log(`[Scraper] Scraping topic: "${keyword}" (max ${maxTweets})`)

  const isLoggedIn = await scraper.isLoggedIn()
  if (!isLoggedIn) {
    console.log(`[Scraper] Skipping topic "${keyword}" — search requires login`)
    return []
  }

  const tweets = []
  const iterator = scraper.searchTweets(keyword, maxTweets, SearchMode.Latest)

  for await (const tweet of iterator) {
    if (tweets.length >= maxTweets) break
    if (tweet.text) tweets.push(tweet)
  }

  const normalized = tweets.map(t => normalizeTweet(t, 'topic', keyword))
  const filtered = normalized.filter(isWorthKeeping)
  console.log(`[Scraper] Got ${tweets.length} tweets for "${keyword}", ${filtered.length} passed quality filter`)
  return filtered
}

// Drop low-value posts: too short, pure self-promo, motivational fluff, personal rants
function isWorthKeeping(post) {
  const text = (post.text || '').toLowerCase()
  const wordCount = text.split(/\s+/).length

  // Too short to be useful (under 15 words and no link)
  if (wordCount < 15 && !text.includes('http')) return false

  // Pure retweet with no commentary
  if (text.startsWith('rt @')) return false

  // Motivational one-liners with no substance
  const fluffPatterns = [
    /^(just|remember|never|always|stop|start|the secret|the key|pro tip|hot take)[:\s]/,
    /pay your rent/,
    /most people won't/,
    /here'?s the thing/,
    /unpopular opinion/,
    /this is the way/,
    /let that sink in/,
    /read that again/,
    /thread 🧵/,
  ]
  if (fluffPatterns.some(p => p.test(text)) && wordCount < 30) return false

  // Purely personal (no GTM/tech/business signal)
  const personalPatterns = [
    /^(good morning|happy birthday|rip |prayers|congrats to my)/,
    /^(heading to|just landed|at the airport|on my way)/,
    /^(my wife|my kid|my dog|my cat|my family)/,
  ]
  if (personalPatterns.some(p => p.test(text))) return false

  return true
}

function deduplicatePosts(existing, newPosts) {
  const existingIds = new Set(existing.map(p => p.id))
  const existingTexts = new Set(existing.map(p => p.text?.slice(0, 100)))

  const unique = newPosts.filter(post => {
    if (existingIds.has(post.id)) return false
    if (post.text && existingTexts.has(post.text.slice(0, 100))) return false
    existingIds.add(post.id)
    existingTexts.add(post.text?.slice(0, 100))
    return true
  })

  console.log(`[Scraper] Dedup: ${newPosts.length} scraped, ${unique.length} new, ${newPosts.length - unique.length} duplicates`)
  return unique
}

async function runScrape({ accounts = true, topics = true, maxTweetsPerSource = 20 } = {}) {
  const scraper = await createClient()
  const allNewPosts = []
  const errors = []

  if (accounts) {
    const accountList = readJSON('accounts.json')
    for (const account of accountList) {
      try {
        const posts = await scrapeByAccount(scraper, account.handle, maxTweetsPerSource)
        posts.forEach(p => { p.category = account.category })
        allNewPosts.push(...posts)
      } catch (err) {
        console.error(`[Scraper] Error scraping @${account.handle}:`, err.message)
        errors.push({ source: 'account', value: account.handle, error: err.message })
      }
    }
  }

  if (topics) {
    const topicList = readJSON('topics.json')
    for (const keyword of topicList) {
      try {
        const posts = await scrapeByTopic(scraper, keyword, maxTweetsPerSource)
        allNewPosts.push(...posts)
      } catch (err) {
        console.error(`[Scraper] Error scraping topic "${keyword}":`, err.message)
        errors.push({ source: 'topic', value: keyword, error: err.message })
      }
    }
  }

  const existingPosts = readJSON('posts.json')
  const uniqueNew = deduplicatePosts(existingPosts, allNewPosts)

  const merged = [...existingPosts, ...uniqueNew]
  writeJSON('posts.json', merged)

  const result = {
    status: 'completed',
    totalScraped: allNewPosts.length,
    newPosts: uniqueNew.length,
    duplicatesSkipped: allNewPosts.length - uniqueNew.length,
    totalPosts: merged.length,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString()
  }

  console.log(`[Scraper] Done: ${result.newPosts} new posts added (${result.totalPosts} total)`)
  return result
}

module.exports = { runScrape }
