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

  const hasActiveFilters = tier !== 'All' || category !== 'All' || search.trim()

  function clearFilters() {
    setTier('All')
    setCategory('All')
    setSearch('')
  }

  const filtered = useMemo(() => {
    let result = posts

    if (tier === 'High') result = result.filter((p) => p.score >= 85)
    else if (tier === 'Mid') result = result.filter((p) => p.score >= 65 && p.score < 85)
    else if (tier === 'Low') result = result.filter((p) => p.score != null && p.score < 65)
    else result = result.filter((p) => p.score != null)

    if (category !== 'All') {
      result = result.filter((p) => p.category === category)
    }

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
      <div className="feed-summary">
        <span><span className="feed-summary__number">{posts.length}</span> posts</span>
        <span className="feed-summary__sep">/</span>
        <span><span className="feed-summary__number">{scored.length}</span> scored</span>
        {highCount > 0 && (
          <>
            <span className="feed-summary__sep">/</span>
            <span className="feed-summary__high"><span className="feed-summary__number">{highCount}</span> high</span>
          </>
        )}
        {midCount > 0 && (
          <>
            <span className="feed-summary__sep">/</span>
            <span className="feed-summary__mid"><span className="feed-summary__number">{midCount}</span> mid</span>
          </>
        )}
      </div>

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-sep" />
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
        <div className="filter-sep" />
        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
          ))}
        </select>
        {hasActiveFilters && (
          <button className="filter-clear" onClick={clearFilters}>Clear</button>
        )}
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-state__title">Loading...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {posts.length === 0 ? (
            <>
              <div className="empty-state__title">No posts yet</div>
              <div className="empty-state__text">Get started in three steps</div>
              <div className="empty-state__steps">
                <div className="empty-step">
                  <div className="empty-step__num">1</div>
                  <div className="empty-step__label">Scrape</div>
                  <div className="empty-step__desc">Pull tweets from tracked accounts</div>
                </div>
                <div className="empty-step">
                  <div className="empty-step__num">2</div>
                  <div className="empty-step__label">Score</div>
                  <div className="empty-step__desc">Rank posts by GTM relevance</div>
                </div>
                <div className="empty-step">
                  <div className="empty-step__num">3</div>
                  <div className="empty-step__label">Browse</div>
                  <div className="empty-step__desc">Filter and find what matters</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="empty-state__title">No matches</div>
              <div className="empty-state__text">
                Try different filters or <button className="filter-clear" onClick={clearFilters}>clear all</button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="feed">
          <div className="feed__count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</div>
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
