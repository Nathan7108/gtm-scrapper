import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Intel Feed', icon: '◉' },
  { to: '/accounts', label: 'Accounts', icon: '⊕' },
  { to: '/topics', label: 'Topics', icon: '⬡' },
  { to: '/digest', label: 'Digest', icon: '⊞' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <h1>GTM INTEL</h1>
        <span>Signal Intelligence Platform</span>
      </div>

      <nav className="sidebar__nav">
        <div className="nav-section">Navigation</div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
          >
            <span className="nav-item__icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        v1.0.0 — GTM Intel
      </div>
    </aside>
  )
}
