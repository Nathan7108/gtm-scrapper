function scoreTier(score) {
  if (score == null) return null
  if (score >= 85) return { label: 'High', className: 'badge--high' }
  if (score >= 65) return { label: 'Mid', className: 'badge--mid' }
  return { label: 'Low', className: 'badge--low' }
}

function initials(name) {
  if (!name || !name.trim()) return '?'
  return name.trim().split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const now = new Date()
  const diffMs = now - d
  const diffHours = diffMs / (1000 * 60 * 60)
  if (diffHours < 1) return `${Math.floor(diffMs / 60000)}m`
  if (diffHours < 24) return `${Math.floor(diffHours)}h`
  if (diffHours < 24 * 7) return `${Math.floor(diffHours / 24)}d`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

function formatNumber(n) {
  if (n == null || n === 0) return null
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function linkifyText(text) {
  if (!text) return ''
  return text.replace(
    /(https?:\/\/\S+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="post-card__link">$1</a>'
  ).replace(
    /@(\w{1,15})/g,
    '<a href="https://x.com/$1" target="_blank" rel="noopener noreferrer" class="post-card__mention">@$1</a>'
  )
}

export default function PostCard({ post }) {
  const tier = scoreTier(post.score)
  const date = formatDate(post.date)
  const likes = formatNumber(post.likes)
  const retweets = formatNumber(post.retweets)
  const replies = formatNumber(post.replies)

  return (
    <article className="post-card">
      <div className="post-card__header">
        <a
          className="post-card__author"
          href={`https://x.com/${post.handle}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="post-card__avatar">{initials(post.author)}</div>
          <div className="post-card__author-info">
            <span className="post-card__name">{post.author || 'Unknown'}</span>
            <span className="post-card__handle">@{post.handle || 'unknown'}</span>
          </div>
        </a>
        <div className="post-card__header-right">
          {date && <span className="post-card__date">{date}</span>}
          {tier && (
            <div className="post-card__score-group">
              <span className={`badge ${tier.className}`}>{tier.label}</span>
              <span className="post-card__score">{post.score}</span>
            </div>
          )}
        </div>
      </div>

      <div
        className="post-card__text"
        dangerouslySetInnerHTML={{ __html: linkifyText(post.text) }}
      />

      {post.insight && <div className="post-card__insight">{post.insight}</div>}

      <div className="post-card__footer">
        <div className="post-card__stats">
          {replies && (
            <span className="post-card__stat">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {replies}
            </span>
          )}
          {retweets && (
            <span className="post-card__stat">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              {retweets}
            </span>
          )}
          {likes && (
            <span className="post-card__stat">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {likes}
            </span>
          )}
        </div>
        <div className="post-card__actions">
          {post.category && <span className="badge badge--small badge--category">{post.category}</span>}
          {post.url && (
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-card__open">
              Open on X
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
