const { Resend } = require('resend')
const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '..', 'data')

function readJSON(file) {
  const filePath = path.join(dataDir, file)
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function buildDigestHTML(posts) {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const postRows = posts
    .map(
      (p, i) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #21262d;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 600; color: #c9d1d9;">#${i + 1} — @${p.handle}</span>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: ${
              p.score >= 85 ? '#f97316' : '#3b82f6'
            }; font-weight: 700;">${p.score}</span>
          </div>
          <p style="color: #8b949e; font-size: 14px; line-height: 1.5; margin: 0 0 8px 0;">${p.text?.slice(0, 280) || ''}${
        (p.text?.length || 0) > 280 ? '...' : ''
      }</p>
          ${
            p.insight
              ? `<div style="background: rgba(0, 212, 170, 0.08); border-left: 3px solid #00d4aa; padding: 8px 12px; font-size: 13px; color: #00d4aa; border-radius: 0 4px 4px 0;">${p.insight}</div>`
              : ''
          }
        </td>
      </tr>`
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background: #0a0e13; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-family: 'IBM Plex Mono', monospace; font-size: 20px; color: #00d4aa; margin: 0;">GTM INTEL</h1>
      <p style="color: #8b949e; font-size: 13px; margin-top: 4px;">Daily Signal Digest — ${date}</p>
    </div>

    <div style="background: #111820; border: 1px solid #21262d; border-radius: 8px; padding: 20px;">
      <h2 style="font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #58a6ff; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em;">Top ${posts.length} Posts</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        ${postRows}
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px; color: #484f58; font-size: 12px;">
      <p>Powered by GTM Intel — Signal Intelligence Platform</p>
    </div>
  </div>
</body>
</html>`
}

async function sendDigest({ topN = 5, preview = false } = {}) {
  const posts = readJSON('posts.json')
  const scored = posts
    .filter((p) => p.score != null)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)

  if (scored.length === 0) {
    return { status: 'error', message: 'No scored posts to include in digest' }
  }

  const html = buildDigestHTML(scored)

  if (preview) {
    return { status: 'preview', html, postCount: scored.length }
  }

  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.DIGEST_EMAIL

  if (!apiKey) {
    return { status: 'error', message: 'RESEND_API_KEY not set in .env' }
  }
  if (!toEmail) {
    return { status: 'error', message: 'DIGEST_EMAIL not set in .env' }
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from: 'GTM Intel <onboarding@resend.dev>',
    to: [toEmail],
    subject: `GTM Intel Daily Digest — Top ${scored.length} Posts`,
    html,
  })

  if (error) {
    return { status: 'error', message: error.message }
  }

  return {
    status: 'sent',
    emailId: data.id,
    to: toEmail,
    postCount: scored.length,
    timestamp: new Date().toISOString(),
  }
}

module.exports = { sendDigest, buildDigestHTML }
