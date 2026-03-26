function scoreTier(score) {
  if (score == null) return null
  if (score >= 85) return { label: 'High', className: 'badge--high' }
  if (score >= 65) return { label: 'Mid', className: 'badge--mid' }
  return { label: 'Low', className: 'badge--low' }
}

function initials(name) {
  if (!name || !name.trim()) return '?'
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function PostCard({ post }) {
  const tier = scoreTier(post.score)

  return (
    <article className="post-card">
      <div className="post-card__header">
        <div className="post-card__author">
          <div className="post-card__avatar">{initials(post.author)}</div>
          <div>
            <div className="post-card__name">{post.author || 'Unknown'}</div>
            <div className="post-card__handle">@{post.handle || 'unknown'}</div>
          </div>
        </div>
        {tier && (
          <div className="post-card__score-group">
            <span className={`badge ${tier.className}`}>{tier.label}</span>
            <span className="post-card__score">{post.score}</span>
          </div>
        )}
      </div>

      <div className="post-card__text">{post.text || ''}</div>

      {post.insight && <div className="post-card__insight">{post.insight}</div>}

      <div className="post-card__meta">
        {post.category && <span className="badge badge--small badge--category">{post.category}</span>}
        {formatDate(post.date) && <span>{formatDate(post.date)}</span>}
        {post.url && <a href={post.url} target="_blank" rel="noopener noreferrer">View original</a>}
      </div>
    </article>
  )
}
