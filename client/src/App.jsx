import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Feed from './components/Feed'

const PAGES = {
  feed: { title: 'Intelligence Feed', subtitle: 'Scored posts ranked by GTM relevance' },
  accounts: { title: 'Tracked Accounts', subtitle: 'Manage monitored Twitter/X accounts' },
  topics: { title: 'Topic Filters', subtitle: 'Configure keyword tracking' },
  digest: { title: 'Email Digest', subtitle: 'Generate and send top-post summaries' },
  settings: { title: 'Settings', subtitle: 'Configure scraping and scoring' },
}

export default function App() {
  const [page, setPage] = useState('feed')
  const current = PAGES[page]

  return (
    <div className="app">
      <Sidebar activePage={page} onNavigate={setPage} />
      <main className="main">
        <header className="main__header scanline">
          <div>
            <div className="main__title">{current.title}</div>
            <div className="main__subtitle">{current.subtitle}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn--ghost" onClick={() => fetch('/api/scrape', { method: 'POST' })}>
              Run Scrape
            </button>
            <button className="btn btn--primary" onClick={() => fetch('/api/score', { method: 'POST' })}>
              Score Posts
            </button>
          </div>
        </header>
        <div className="main__content">
          {page === 'feed' && <Feed />}
          {page === 'accounts' && <PlaceholderPage name="Accounts" />}
          {page === 'topics' && <PlaceholderPage name="Topics" />}
          {page === 'digest' && <PlaceholderPage name="Digest" />}
          {page === 'settings' && <PlaceholderPage name="Settings" />}
        </div>
      </main>
    </div>
  )
}

function PlaceholderPage({ name }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{ { Accounts: '👤', Topics: '🏷', Digest: '📧', Settings: '⚙' }[name] }</div>
      <div className="empty-state__title">{name}</div>
      <div className="empty-state__text">This page will be built in a later sprint.</div>
    </div>
  )
}
