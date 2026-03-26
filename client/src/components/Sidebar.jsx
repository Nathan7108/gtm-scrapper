const NAV_ITEMS = [
  { key: 'feed', label: 'Intel Feed', icon: '◉' },
  { key: 'accounts', label: 'Accounts', icon: '⊕' },
  { key: 'topics', label: 'Topics', icon: '⬡' },
  { key: 'digest', label: 'Digest', icon: '⊞' },
  { key: 'settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <h1>GTM INTEL</h1>
        <span>Signal Intelligence Platform</span>
      </div>

      <nav className="sidebar__nav">
        <div className="nav-section">Navigation</div>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.key}
            className={`nav-item ${activePage === item.key ? 'nav-item--active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-item__icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        v1.0.0 — GTM Intel
      </div>
    </aside>
  )
}
