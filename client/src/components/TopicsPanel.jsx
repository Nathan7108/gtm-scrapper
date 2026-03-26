import { useState, useEffect, useCallback } from 'react'

export default function TopicsPanel() {
  const [topics, setTopics] = useState([])
  const [newTopic, setNewTopic] = useState('')
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  const fetchTopics = useCallback(() => {
    setError(null)
    fetch('/api/topics')
      .then((r) => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`)
        return r.json()
      })
      .then((data) => setTopics(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => { fetchTopics() }, [fetchTopics])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(t)
  }, [notice])

  async function saveTopics(updated) {
    setSaving(true)
    try {
      const res = await fetch('/api/topics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error(`Save failed (${res.status})`)
      setTopics(updated)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
    setRemoving(null)
  }

  function addTopic(e) {
    e.preventDefault()
    if (!newTopic.trim()) return
    const keyword = newTopic.trim()
    if (topics.some((t) => t.toLowerCase() === keyword.toLowerCase())) {
      setNotice(`"${keyword}" is already tracked`)
      return
    }
    saveTopics([...topics, keyword])
    setNewTopic('')
  }

  function removeTopic(topicToRemove) {
    if (removing === topicToRemove) {
      saveTopics(topics.filter((t) => t !== topicToRemove))
    } else {
      setRemoving(topicToRemove)
    }
  }

  if (error && topics.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="empty-state__title">Failed to load topics</h2>
        <p className="empty-state__text">{error}</p>
        <button className="btn btn--ghost" onClick={fetchTopics} style={{ marginTop: 16 }}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="panel">
      <form className="panel__form" onSubmit={addTopic}>
        <input
          className="search-input flex-1"
          placeholder="Add keyword or phrase..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          aria-label="Topic keyword"
          maxLength={100}
          required
        />
        <button className="btn btn--primary" type="submit" disabled={saving}>
          Add
        </button>
      </form>

      {notice && (
        <div className="toast toast--info toast--inline">{notice}</div>
      )}

      {error && topics.length > 0 && (
        <div className="toast toast--error toast--inline">{error}</div>
      )}

      <div className="panel__list">
        {topics.length === 0 && !error && (
          <div className="empty-state">
            <p className="empty-state__text">No topics tracked yet. Add one above.</p>
          </div>
        )}
        {topics.map((topic) => (
          <div key={topic} className="panel__item">
            <div className="panel__item-info">
              <span className="panel__item-name">{topic}</span>
            </div>
            <button
              className={`btn btn--ghost btn--small ${removing === topic ? 'btn--danger' : ''}`}
              onClick={() => removeTopic(topic)}
              onBlur={() => setRemoving(null)}
            >
              {removing === topic ? 'Confirm?' : 'Remove'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
