import { useState } from 'react'

export default function DigestPage() {
  const [topN, setTopN] = useState(5)
  const [previewHTML, setPreviewHTML] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handlePreview() {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topN, preview: true }),
      })
      const data = await res.json()
      if (data.status === 'preview') {
        setPreviewHTML(data.html)
        setStatus({ type: 'info', message: `Preview: ${data.postCount} posts included` })
      } else {
        setStatus({ type: 'error', message: data.message })
      }
    } catch {
      setStatus({ type: 'error', message: 'Failed to generate preview' })
    }
    setLoading(false)
  }

  async function handleSend() {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topN, preview: false }),
      })
      const data = await res.json()
      if (data.status === 'sent') {
        setStatus({ type: 'success', message: `Digest sent to ${data.to} (${data.postCount} posts)` })
      } else {
        setStatus({ type: 'error', message: data.message })
      }
    } catch {
      setStatus({ type: 'error', message: 'Failed to send digest' })
    }
    setLoading(false)
  }

  return (
    <div className="panel">
      <div className="digest-controls">
        <label className="digest-label">
          <span>Top posts to include:</span>
          <input
            type="number"
            className="search-input"
            value={topN}
            onChange={(e) => setTopN(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            max={20}
            style={{ width: 80 }}
          />
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn--ghost" onClick={handlePreview} disabled={loading}>
            {loading ? 'Loading...' : 'Preview'}
          </button>
          <button className="btn btn--primary" onClick={handleSend} disabled={loading}>
            {loading ? 'Sending...' : 'Send Digest'}
          </button>
        </div>
      </div>

      {status && (
        <div className={`digest-status digest-status--${status.type}`}>
          {status.message}
        </div>
      )}

      {previewHTML && (
        <div className="digest-preview">
          <div className="digest-preview__label">Email Preview</div>
          <iframe
            srcDoc={previewHTML}
            title="Digest Preview"
            className="digest-preview__frame"
          />
        </div>
      )}
    </div>
  )
}
