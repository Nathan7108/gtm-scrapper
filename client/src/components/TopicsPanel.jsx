import { useState, useEffect } from 'react'

export default function TopicsPanel() {
  const [topics, setTopics] = useState([])
  const [newTopic, setNewTopic] = useState('')
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    fetch('/api/topics')
      .then((r) => r.json())
      .then(setTopics)
  }, [])

  async function saveTopics(updated) {
    setSaving(true)
    await fetch('/api/topics', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setTopics(updated)
    setSaving(false)
    setRemoving(null)
  }

  function addTopic(e) {
    e.preventDefault()
    if (!newTopic.trim()) return
    const keyword = newTopic.trim()
    if (topics.includes(keyword)) return
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

  return (
    <div className="panel">
      <form className="panel__form" onSubmit={addTopic}>
        <input
          className="search-input"
          placeholder="Add keyword or phrase..."
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          style={{ flex: 1 }}
          required
        />
        <button className="btn btn--primary" type="submit" disabled={saving}>
          Add
        </button>
      </form>

      <div className="panel__list">
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
