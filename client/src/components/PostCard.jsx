function scoreTier(score) {
  if (score >= 85) return { label: 'High', className: 'badge--high' }
  if (score >= 65) return { label: 'Mid', className: 'badge--mid' }
  return { label: 'Low', className: 'badge--low' }
}

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function PostCard({ post }) {
  const tier = scoreTier(post.score)

  return (
    <div className="post-card">
      <div className="post-card__header">
        <div className="post-card__author">
          <div className="post-card__avatar">{initials(post.author || 'UN')}</div>
          <div>
            <div className="post-card__name">{post.author}</div>
            <div className="post-card__handle">@{post.handle}</div>
          </div>
        </div>
        <div className="post-card__score-group">
          <span className={`badge ${tier.className}`}>{tier.label}</span>
          <span className="post-card__score">{post.score}</span>
        </div>
      </div>

      <div className="post-card__text">{post.text}</div>

      {post.insight && <div className="post-card__insight">{post.insight}</div>}

      <div className="post-card__meta">
        {post.category && <span className="badge badge--small badge--category">{post.category}</span>}
        {post.date && <span>{formatDate(post.date)}</span>}
        {post.url && <a href={post.url} target="_blank" rel="noopener noreferrer">View original</a>}
      </div>
    </div>
  )
}
