import { useState, useEffect } from 'react'

const CATEGORIES = ['GTM', 'SaaS', 'Sales', 'PLG', 'Growth', 'AI', 'Startup']

export default function AccountsPanel() {
  const [accounts, setAccounts] = useState([])
  const [handle, setHandle] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('GTM')
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/accounts')
      .then((r) => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`)
        return r.json()
      })
      .then(setAccounts)
      .catch((err) => setError(err.message))
  }, [])

  async function saveAccounts(updated) {
    setSaving(true)
    try {
      const res = await fetch('/api/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error(`Save failed (${res.status})`)
      setAccounts(updated)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
    setRemoving(null)
  }

  function addAccount(e) {
    e.preventDefault()
    if (!handle.trim() || !name.trim()) return
    const cleaned = handle.replace('@', '').trim()
    if (accounts.some((a) => a.handle === cleaned)) return
    saveAccounts([...accounts, { handle: cleaned, name: name.trim(), category }])
    setHandle('')
    setName('')
  }

  function removeAccount(handleToRemove) {
    if (removing === handleToRemove) {
      saveAccounts(accounts.filter((a) => a.handle !== handleToRemove))
    } else {
      setRemoving(handleToRemove)
    }
  }

  if (error && accounts.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="empty-state__title">Failed to load accounts</h2>
        <p className="empty-state__text">{error}</p>
      </div>
    )
  }

  return (
    <div className="panel">
      <form className="panel__form" onSubmit={addAccount}>
        <input
          className="search-input"
          placeholder="@handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          aria-label="Twitter handle"
          required
        />
        <input
          className="search-input"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Display name"
          required
        />
        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button className="btn btn--primary" type="submit" disabled={saving}>
          Add
        </button>
      </form>

      {error && accounts.length > 0 && (
        <div className="toast toast--error toast--inline">
          {error}
        </div>
      )}

      <div className="panel__list">
        {accounts.map((account) => (
          <div key={account.handle} className="panel__item">
            <div className="panel__item-info">
              <span className="panel__item-name">{account.name}</span>
              <span className="panel__item-handle">@{account.handle}</span>
              <span className="badge badge--small badge--category">{account.category}</span>
            </div>
            <button
              className={`btn btn--ghost btn--small ${removing === account.handle ? 'btn--danger' : ''}`}
              onClick={() => removeAccount(account.handle)}
              onBlur={() => setRemoving(null)}
            >
              {removing === account.handle ? 'Confirm?' : 'Remove'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
