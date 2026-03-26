import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Feed from './components/Feed'
import AccountsPanel from './components/AccountsPanel'
import TopicsPanel from './components/TopicsPanel'
import DigestPage from './components/DigestModal'

const PAGES = {
  '/': { title: 'Intelligence Feed', subtitle: 'Scored posts ranked by GTM relevance' },
  '/accounts': { title: 'Tracked Accounts', subtitle: 'Manage monitored Twitter/X accounts' },
  '/topics': { title: 'Topic Filters', subtitle: 'Configure keyword tracking' },
  '/digest': { title: 'Email Digest', subtitle: 'Generate and send top-post summaries' },
  '/settings': { title: 'Settings', subtitle: 'Configure scraping and scoring' },
}

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={
            <PageLayout page="/" onRefresh={() => setRefreshKey((k) => k + 1)}>
              <Feed key={refreshKey} />
            </PageLayout>
          } />
          <Route path="/accounts" element={<PageLayout page="/accounts"><AccountsPanel /></PageLayout>} />
          <Route path="/topics" element={<PageLayout page="/topics"><TopicsPanel /></PageLayout>} />
          <Route path="/digest" element={<PageLayout page="/digest"><DigestPage /></PageLayout>} />
          <Route path="/settings" element={<PageLayout page="/settings"><PlaceholderPage name="Settings" /></PageLayout>} />
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

  async function handleScrape() {
    setScraping(true)
    setStatus(null)
    try {
      const res = await fetch('/api/scrape', { method: 'POST' })
      const data = await res.json()
      if (data.status === 'completed') {
        setStatus({ type: 'success', message: `Scraped ${data.newPosts} new posts (${data.totalPosts} total)` })
        onRefresh?.()
      } else {
        setStatus({ type: 'error', message: data.message })
      }
    } catch {
      setStatus({ type: 'error', message: 'Scrape request failed' })
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
        setStatus({ type: 'success', message: `Scored ${data.scored} posts (${data.remaining} remaining)` })
        onRefresh?.()
      } else {
        setStatus({ type: 'error', message: data.message })
      }
    } catch {
      setStatus({ type: 'error', message: 'Score request failed' })
    }
    setScoring(false)
  }

  return (
    <>
      <header className="main__header scanline">
        <div>
          <div className="main__title">{current.title}</div>
          <div className="main__subtitle">{current.subtitle}</div>
        </div>
        {page === '/' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn--ghost" onClick={handleScrape} disabled={scraping}>
              {scraping ? 'Scraping...' : 'Run Scrape'}
            </button>
            <button className="btn btn--primary" onClick={handleScore} disabled={scoring}>
              {scoring ? 'Scoring...' : 'Score Posts'}
            </button>
          </div>
        )}
      </header>
      {status && (
        <div className={`toast toast--${status.type}`}>
          {status.message}
          <button className="toast__close" onClick={() => setStatus(null)}>&times;</button>
        </div>
      )}
      <div className="main__content">
        {children}
      </div>
    </>
  )
}

function PlaceholderPage({ name }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{{ Settings: '⚙' }[name]}</div>
      <div className="empty-state__title">{name}</div>
      <div className="empty-state__text">This page will be built in a later sprint.</div>
    </div>
  )
}
