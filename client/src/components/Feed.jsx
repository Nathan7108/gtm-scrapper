import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import PostCard from './PostCard'

const TIERS = ['All', 'High', 'Mid', 'Low']
const CATEGORIES = ['All', 'GTM', 'SaaS', 'Sales', 'PLG', 'Growth', 'AI', 'Startup']

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [tier, setTier] = useState('All')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const debouncedSearch = useDebounce(search, 200)

  const fetchPosts = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    fetch('/api/posts', { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`)
        return r.json()
      })
      .then((data) => {
        setPosts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchPosts()
    return () => { if (abortRef.current) abortRef.current.abort() }
  }, [fetchPosts])

  const hasActiveFilters = tier !== 'All' || category !== 'All' || debouncedSearch.trim()

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

    if (category !== 'All') {
      result = result.filter((p) => p.category === category)
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(
        (p) =>
          (p.text && p.text.toLowerCase().includes(q)) ||
          (p.author && p.author.toLowerCase().includes(q)) ||
          (p.handle && p.handle.toLowerCase().includes(q)) ||
          (p.insight && p.insight.toLowerCase().includes(q))
      )
    }

    return [...result].sort((a, b) => (b.score || 0) - (a.score || 0))
  }, [posts, tier, category, debouncedSearch])

  const scored = posts.filter((p) => p.score != null)
  const highCount = scored.filter((p) => p.score >= 85).length
  const midCount = scored.filter((p) => p.score >= 65 && p.score < 85).length

  if (error) {
    return (
      <div className="empty-state">
        <h2 className="empty-state__title">Failed to load posts</h2>
        <p className="empty-state__text">{error}</p>
        <button className="btn btn--ghost" onClick={fetchPosts} style={{ marginTop: 16 }}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="feed-summary" aria-label="Post statistics">
        <span><span className="feed-summary__number">{posts.length}</span> posts</span>
        <span className="feed-summary__sep" aria-hidden="true">/</span>
        <span><span className="feed-summary__number">{scored.length}</span> scored</span>
        {highCount > 0 && (
          <>
            <span className="feed-summary__sep" aria-hidden="true">/</span>
            <span className="feed-summary__high"><span className="feed-summary__number">{highCount}</span> high</span>
          </>
        )}
        {midCount > 0 && (
          <>
            <span className="feed-summary__sep" aria-hidden="true">/</span>
            <span className="feed-summary__mid"><span className="feed-summary__number">{midCount}</span> mid</span>
          </>
        )}
      </div>

      <div className="filters" role="search" aria-label="Filter posts">
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search posts"
        />
        <div className="filter-sep" aria-hidden="true" />
        <div className="filter-group" role="group" aria-label="Filter by tier">
          {TIERS.map((t) => (
            <button
              key={t}
              className={`filter-btn ${tier === t ? 'filter-btn--active' : ''}`}
              onClick={() => setTier(t)}
              aria-pressed={tier === t}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="filter-sep" aria-hidden="true" />
        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
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
        <div className="empty-state" role="status">
          <h2 className="empty-state__title">Loading...</h2>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {posts.length === 0 ? (
            <>
              <h2 className="empty-state__title">No posts yet</h2>
              <p className="empty-state__text">Get started in three steps</p>
              <div className="empty-state__steps">
                <div className="empty-step">
                  <div className="empty-step__num" aria-hidden="true">1</div>
                  <div className="empty-step__label">Scrape</div>
                  <div className="empty-step__desc">Pull tweets from tracked accounts</div>
                </div>
                <div className="empty-step">
                  <div className="empty-step__num" aria-hidden="true">2</div>
                  <div className="empty-step__label">Score</div>
                  <div className="empty-step__desc">Rank posts by GTM relevance</div>
                </div>
                <div className="empty-step">
                  <div className="empty-step__num" aria-hidden="true">3</div>
                  <div className="empty-step__label">Browse</div>
                  <div className="empty-step__desc">Filter and find what matters</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="empty-state__title">No matches</h2>
              <p className="empty-state__text">
                Try different filters or <button className="filter-clear" onClick={clearFilters}>clear all</button>
              </p>
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
