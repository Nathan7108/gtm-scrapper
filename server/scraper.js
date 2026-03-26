const { ApifyClient } = require('apify-client')
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

function generateId(tweet) {
  return `${tweet.author?.userName || 'unknown'}_${tweet.id || Date.now()}`
}

function normalizeTweet(raw, source, sourceValue) {
  return {
    id: generateId(raw),
    tweetId: raw.id || null,
    text: raw.text || raw.full_text || '',
    author: raw.author?.name || raw.user?.name || 'Unknown',
    handle: raw.author?.userName || raw.user?.screen_name || 'unknown',
    avatar: raw.author?.profileImageUrl || raw.user?.profile_image_url_https || null,
    date: raw.createdAt || raw.created_at || new Date().toISOString(),
    likes: raw.likeCount || raw.favorite_count || 0,
    retweets: raw.retweetCount || raw.retweet_count || 0,
    replies: raw.replyCount || raw.reply_count || 0,
    url: raw.url || (raw.id ? `https://x.com/i/status/${raw.id}` : null),
    source,
    sourceValue,
    score: null,
    tier: null,
    insight: null,
    category: null,
    scrapedAt: new Date().toISOString()
  }
}

async function scrapeByAccount(client, handle, maxTweets = 20) {
  console.log(`[Scraper] Scraping account: @${handle} (max ${maxTweets})`)

  const run = await client.actor('quacker/twitter-scraper').call({
    handles: [handle],
    tweetsDesired: maxTweets,
    proxyConfig: { useApifyProxy: true }
  })

  const { items } = await client.dataset(run.defaultDatasetId).listItems()
  console.log(`[Scraper] Got ${items.length} tweets from @${handle}`)

  return items.map(tweet => normalizeTweet(tweet, 'account', handle))
}

async function scrapeByTopic(client, keyword, maxTweets = 20) {
  console.log(`[Scraper] Scraping topic: "${keyword}" (max ${maxTweets})`)

  const run = await client.actor('quacker/twitter-scraper').call({
    searchTerms: [keyword],
    tweetsDesired: maxTweets,
    searchMode: 'live',
    proxyConfig: { useApifyProxy: true }
  })

  const { items } = await client.dataset(run.defaultDatasetId).listItems()
  console.log(`[Scraper] Got ${items.length} tweets for "${keyword}"`)

  return items.map(tweet => normalizeTweet(tweet, 'topic', keyword))
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
  const token = process.env.APIFY_API_TOKEN
  if (!token) {
    throw new Error('APIFY_API_TOKEN not set in .env')
  }

  const client = new ApifyClient({ token })
  const allNewPosts = []
  const errors = []

  if (accounts) {
    const accountList = readJSON('accounts.json')
    for (const account of accountList) {
      try {
        const posts = await scrapeByAccount(client, account.handle, maxTweetsPerSource)
        // Tag with category from accounts.json
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
        const posts = await scrapeByTopic(client, keyword, maxTweetsPerSource)
        allNewPosts.push(...posts)
      } catch (err) {
        console.error(`[Scraper] Error scraping topic "${keyword}":`, err.message)
        errors.push({ source: 'topic', value: keyword, error: err.message })
      }
    }
  }

  // Deduplicate against existing posts
  const existingPosts = readJSON('posts.json')
  const uniqueNew = deduplicatePosts(existingPosts, allNewPosts)

  // Merge and save
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
