import { useState, useEffect, useMemo } from 'react'
import PostCard from './PostCard'

const TIERS = ['All', 'High', 'Mid', 'Low']
const CATEGORIES = ['All', 'GTM', 'SaaS', 'Sales', 'PLG', 'Growth', 'AI', 'Startup']

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [tier, setTier] = useState('All')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
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

  const filtered = useMemo(() => {
    let result = posts

    // Tier filter
    if (tier === 'High') result = result.filter((p) => p.score >= 85)
    else if (tier === 'Mid') result = result.filter((p) => p.score >= 65 && p.score < 85)
    else if (tier === 'Low') result = result.filter((p) => p.score != null && p.score < 65)
    else result = result.filter((p) => p.score != null)

    // Category filter
    if (category !== 'All') {
      result = result.filter((p) => p.category === category)
    }

    // Keyword search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          (p.text && p.text.toLowerCase().includes(q)) ||
          (p.author && p.author.toLowerCase().includes(q)) ||
          (p.handle && p.handle.toLowerCase().includes(q)) ||
          (p.insight && p.insight.toLowerCase().includes(q))
      )
    }

    return [...result].sort((a, b) => (b.score || 0) - (a.score || 0))
  }, [posts, tier, category, search])

  const scored = posts.filter((p) => p.score != null)
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
        <input
          type="text"
          className="search-input"
          placeholder="Search posts, authors, insights..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-group">
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
        <div className="filter-group">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`filter-btn filter-btn--cat ${category === c ? 'filter-btn--active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-state__title">Loading...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">◎</div>
          <div className="empty-state__title">No posts match</div>
          <div className="empty-state__text">
            {posts.length === 0
              ? 'Hit "Run Scrape" to pull tweets, then "Score Posts" to rank them.'
              : 'Try adjusting your filters or search query.'}
          </div>
        </div>
      ) : (
        <div className="feed">
          <div className="feed__count">{filtered.length} post{filtered.length !== 1 ? 's' : ''}</div>
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
