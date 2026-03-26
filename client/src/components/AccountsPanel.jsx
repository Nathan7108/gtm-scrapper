import { useState, useEffect, useCallback } from 'react'

const CATEGORIES = ['GTM', 'SaaS', 'Sales', 'PLG', 'Growth', 'AI', 'Startup']

export default function AccountsPanel() {
  const [accounts, setAccounts] = useState([])
  const [handle, setHandle] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('GTM')
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const fetchAccounts = useCallback(() => {
    setError(null)
    fetch('/api/accounts')
      .then((r) => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`)
        return r.json()
      })
      .then((data) => setAccounts(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => { fetchAccounts() }, [fetchAccounts])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(t)
  }, [notice])

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
    const cleaned = handle.replace(/^@/, '').trim()
    if (!cleaned) return
    if (accounts.some((a) => a.handle.toLowerCase() === cleaned.toLowerCase())) {
      setNotice(`@${cleaned} is already tracked`)
      return
    }
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
        <button className="btn btn--ghost" onClick={fetchAccounts} style={{ marginTop: 16 }}>
          Try again
        </button>
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
          maxLength={50}
          required
        />
        <input
          className="search-input"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Display name"
          maxLength={100}
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

      {notice && (
        <div className="toast toast--info toast--inline">{notice}</div>
      )}

      {error && accounts.length > 0 && (
        <div className="toast toast--error toast--inline">{error}</div>
      )}

      <div className="panel__list">
        {accounts.length === 0 && !error && (
          <div className="empty-state">
            <p className="empty-state__text">No accounts tracked yet. Add one above.</p>
          </div>
        )}
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
