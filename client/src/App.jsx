import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Feed from './components/Feed'
import AccountsPanel from './components/AccountsPanel'
import TopicsPanel from './components/TopicsPanel'

const PAGES = {
  '/': { title: 'Intelligence Feed', subtitle: 'Scored posts ranked by GTM relevance' },
  '/accounts': { title: 'Tracked Accounts', subtitle: 'Manage monitored Twitter/X accounts' },
  '/topics': { title: 'Topic Filters', subtitle: 'Configure keyword tracking' },
  '/digest': { title: 'Email Digest', subtitle: 'Generate and send top-post summaries' },
  '/settings': { title: 'Settings', subtitle: 'Configure scraping and scoring' },
}

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<PageLayout page="/"><Feed /></PageLayout>} />
          <Route path="/accounts" element={<PageLayout page="/accounts"><AccountsPanel /></PageLayout>} />
          <Route path="/topics" element={<PageLayout page="/topics"><TopicsPanel /></PageLayout>} />
          <Route path="/digest" element={<PageLayout page="/digest"><PlaceholderPage name="Digest" /></PageLayout>} />
          <Route path="/settings" element={<PageLayout page="/settings"><PlaceholderPage name="Settings" /></PageLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function PageLayout({ page, children }) {
  const current = PAGES[page] || PAGES['/']

  return (
    <>
      <header className="main__header scanline">
        <div>
          <div className="main__title">{current.title}</div>
          <div className="main__subtitle">{current.subtitle}</div>
        </div>
        {page === '/' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn--ghost" onClick={() => fetch('/api/scrape', { method: 'POST' })}>
              Run Scrape
            </button>
            <button className="btn btn--primary" onClick={() => fetch('/api/score', { method: 'POST' })}>
              Score Posts
            </button>
          </div>
        )}
      </header>
      <div className="main__content">
        {children}
      </div>
    </>
  )
}

function PlaceholderPage({ name }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{{ Digest: '📧', Settings: '⚙' }[name]}</div>
      <div className="empty-state__title">{name}</div>
      <div className="empty-state__text">This page will be built in a later sprint.</div>
    </div>
  )
}
