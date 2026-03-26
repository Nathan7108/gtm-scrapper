function scoreTier(score) {
  if (score >= 85) return { label: 'High', className: 'badge--high' }
  if (score >= 65) return { label: 'Mid', className: 'badge--moderate' }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${tier.className}`}>{tier.label}</span>
          <span className="post-card__score">{post.score}</span>
        </div>
      </div>

      <div className="post-card__text">{post.text}</div>

      {post.insight && <div className="post-card__insight">{post.insight}</div>}

      <div className="post-card__meta">
        {post.category && <span>{post.category}</span>}
        {post.date && <span>{post.date}</span>}
      </div>
    </div>
  )
}
