const cron = require('node-cron')
const { runScrape } = require('./scraper')
const { runScore } = require('./scorer')
const { sendDigest } = require('./digest')

let scheduledTask = null

function startScheduler(cronExpression = '0 8 * * *') {
  if (scheduledTask) {
    console.log('[Scheduler] Stopping existing schedule')
    scheduledTask.stop()
  }

  console.log(`[Scheduler] Starting daily pipeline — cron: ${cronExpression}`)

  scheduledTask = cron.schedule(cronExpression, async () => {
    console.log(`[Scheduler] Running daily pipeline at ${new Date().toISOString()}`)

    try {
      // Step 1: Scrape
      console.log('[Scheduler] Step 1/3: Scraping...')
      const scrapeResult = await runScrape()
      console.log(`[Scheduler] Scrape done: ${scrapeResult.newPosts} new posts`)

      // Step 2: Score
      console.log('[Scheduler] Step 2/3: Scoring...')
      const scoreResult = await runScore({ batchSize: 50 })
      console.log(`[Scheduler] Score done: ${scoreResult.scored} posts scored`)

      // Step 3: Send digest (if configured)
      if (process.env.RESEND_API_KEY && process.env.DIGEST_EMAIL) {
        console.log('[Scheduler] Step 3/3: Sending digest...')
        const digestResult = await sendDigest({ topN: 5 })
        console.log(`[Scheduler] Digest: ${digestResult.status}`)
      } else {
        console.log('[Scheduler] Step 3/3: Skipping digest (not configured)')
      }

      console.log('[Scheduler] Daily pipeline complete')
    } catch (err) {
      console.error('[Scheduler] Pipeline failed:', err.message)
    }
  })

  return scheduledTask
}

function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop()
    scheduledTask = null
    console.log('[Scheduler] Stopped')
  }
}

function getSchedulerStatus() {
  return {
    running: scheduledTask !== null,
  }
}

module.exports = { startScheduler, stopScheduler, getSchedulerStatus }
