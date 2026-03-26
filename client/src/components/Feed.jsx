import { useState, useEffect } from 'react'
import PostCard from './PostCard'

const TIERS = ['All', 'High', 'Mid']

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [tier, setTier] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data) => {
        setPosts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const scored = posts.filter((p) => p.score != null)
  const filtered =
    tier === 'All'
      ? scored
      : tier === 'High'
        ? scored.filter((p) => p.score >= 85)
        : scored.filter((p) => p.score >= 65 && p.score < 85)

  const sorted = [...filtered].sort((a, b) => b.score - a.score)

  const highCount = scored.filter((p) => p.score >= 85).length
  const midCount = scored.filter((p) => p.score >= 65 && p.score < 85).length

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Total Posts</div>
          <div className="stat-card__value">{posts.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Scored</div>
          <div className="stat-card__value stat-card__value--accent">{scored.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">High Signal</div>
          <div className="stat-card__value" style={{ color: 'var(--high)' }}>{highCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Mid Signal</div>
          <div className="stat-card__value" style={{ color: 'var(--moderate)' }}>{midCount}</div>
        </div>
      </div>

      <div className="filters">
        {TIERS.map((t) => (
          <button
            key={t}
            className={`filter-btn ${tier === t ? 'filter-btn--active' : ''}`}
            onClick={() => setTier(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-state__title">Loading...</div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">◎</div>
          <div className="empty-state__title">No posts yet</div>
          <div className="empty-state__text">
            Hit "Run Scrape" to pull tweets, then "Score Posts" to rank them.
          </div>
        </div>
      ) : (
        <div className="feed">
          {sorted.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
