import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Feed from './components/Feed'
import AccountsPanel from './components/AccountsPanel'
import TopicsPanel from './components/TopicsPanel'
import DigestPage from './components/DigestModal'

const PAGES = {
  '/': { title: 'Feed', subtitle: 'Posts ranked by relevance' },
  '/accounts': { title: 'Accounts', subtitle: 'Tracked Twitter/X accounts' },
  '/topics': { title: 'Topics', subtitle: 'Keyword tracking' },
  '/digest': { title: 'Digest', subtitle: 'Email summaries' },
  '/settings': { title: 'Settings', subtitle: 'Configuration' },
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const location = useLocation()

  useEffect(() => {
    const page = PAGES[location.pathname]
    document.title = page ? `${page.title} — GTM Intel` : 'GTM Intel'
  }, [location.pathname])

  return (
    <div className="app">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className={`main ${collapsed ? 'main--expanded' : ''}`}>
        <Routes>
          <Route path="/" element={
            <PageLayout page="/" onRefresh={() => setRefreshKey((k) => k + 1)}>
              <Feed key={refreshKey} />
            </PageLayout>
          } />
          <Route path="/accounts" element={<PageLayout page="/accounts"><AccountsPanel /></PageLayout>} />
          <Route path="/topics" element={<PageLayout page="/topics"><TopicsPanel /></PageLayout>} />
          <Route path="/digest" element={<PageLayout page="/digest"><DigestPage /></PageLayout>} />
          <Route path="/settings" element={<PageLayout page="/settings"><PlaceholderPage /></PageLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function PageLayout({ page, children, onRefresh }) {
  const current = PAGES[page] || PAGES['/']
  const [scraping, setScraping] = useState(false)
  const [scoring, setScoring] = useState(false)
  const [status, setStatus] = useState(null)

  const dismissStatus = useCallback(() => setStatus(null), [])

  useEffect(() => {
    if (!status) return
    const timer = setTimeout(dismissStatus, 5000)
    return () => clearTimeout(timer)
  }, [status, dismissStatus])

  async function handleScrape() {
    setScraping(true)
    setStatus(null)
    try {
      const res = await fetch('/api/scrape', { method: 'POST' })
      const data = await res.json()
      if (data.status === 'completed') {
        setStatus({ type: 'success', message: `${data.newPosts} new posts scraped` })
        onRefresh?.()
      } else {
        setStatus({ type: 'error', message: data.message || 'Scrape failed' })
      }
    } catch {
      setStatus({ type: 'error', message: 'Could not reach the server. Is it running?' })
    }
    setScraping(false)
  }

  async function handleScore() {
    setScoring(true)
    setStatus(null)
    try {
      const res = await fetch('/api/score', { method: 'POST' })
      const data = await res.json()
      if (data.status === 'completed') {
        setStatus({ type: 'success', message: `${data.scored} posts scored` })
        onRefresh?.()
      } else {
        setStatus({ type: 'error', message: data.message || 'Scoring failed' })
      }
    } catch {
      setStatus({ type: 'error', message: 'Could not reach the server. Is it running?' })
    }
    setScoring(false)
  }

  return (
    <>
      <header className="main__header">
        <div>
          <div className="main__title">{current.title}</div>
          <div className="main__subtitle">{current.subtitle}</div>
        </div>
        {page === '/' && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn--ghost" onClick={handleScrape} disabled={scraping}>
              {scraping ? 'Scraping...' : 'Scrape'}
            </button>
            <button className="btn btn--primary" onClick={handleScore} disabled={scoring}>
              {scoring ? 'Scoring...' : 'Score'}
            </button>
          </div>
        )}
      </header>
      {status && (
        <div className="toast-region" role="status" aria-live="polite">
          <div className={`toast toast--${status.type}`}>
            {status.message}
            <button className="toast__close" onClick={dismissStatus} aria-label="Dismiss">&times;</button>
          </div>
        </div>
      )}
      <div className="main__content">
        {children}
      </div>
    </>
  )
}

function PlaceholderPage() {
  return (
    <div className="empty-state">
      <div className="empty-state__title">Settings</div>
      <div className="empty-state__text">Configuration options coming soon.</div>
    </div>
  )
}
