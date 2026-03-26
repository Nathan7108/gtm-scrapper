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
        <td style="padding: 14px 0; border-bottom: 1px solid #e2dfd7;">
          <div style="margin-bottom: 4px;">
            <span style="font-weight: 600; color: #262420;">#${i + 1} — @${p.handle}</span>
            <span style="float: right; font-family: monospace; font-size: 13px; color: ${
              p.score >= 85 ? '#6d5e10' : '#3d5a78'
            }; font-weight: 600;">${p.score}</span>
          </div>
          <p style="color: #6e6a60; font-size: 14px; line-height: 1.5; margin: 0 0 6px 0;">${p.text?.slice(0, 280) || ''}${
        (p.text?.length || 0) > 280 ? '...' : ''
      }</p>
          ${
            p.insight
              ? `<div style="background: #f0ece3; border-left: 2px solid #5a4f3e; padding: 6px 10px; font-size: 13px; color: #5a4f3e; border-radius: 0 4px 4px 0;">${p.insight}</div>`
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
<body style="background: #f6f5f1; color: #262420; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto;">
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 18px; color: #262420; margin: 0; font-weight: 600;">GTM Intel</h1>
      <p style="color: #a09a8e; font-size: 13px; margin-top: 2px;">${date}</p>
    </div>

    <div style="background: #ffffff; border: 1px solid #e2dfd7; border-radius: 6px; padding: 18px;">
      <h2 style="font-size: 12px; color: #a09a8e; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 500;">Top ${posts.length} posts</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        ${postRows}
      </table>
    </div>

    <div style="text-align: center; margin-top: 20px; color: #a09a8e; font-size: 11px;">
      <p>GTM Intel</p>
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
