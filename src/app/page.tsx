'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Topic {
  id: string
  name: string
  description: string | null
  language: string | null
  period: string
  lastSyncAt: string | null
  _count: { categories: number }
}

export default function Dashboard() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    language: '',
    period: 'past_month',
  })

  useEffect(() => {
    fetchTopics()
  }, [])

  async function fetchTopics() {
    const res = await fetch('/api/topics')
    setTopics(await res.json())
    setLoading(false)
  }

  async function createTopic(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description || undefined,
        language: form.language || undefined,
        period: form.period,
      }),
    })
    setForm({ name: '', description: '', language: '', period: 'past_month' })
    setShowForm(false)
    fetchTopics()
  }

  async function deleteTopic(id: string) {
    if (!confirm('Delete this topic and all its data?')) return
    await fetch(`/api/topics/${id}`, { method: 'DELETE' })
    fetchTopics()
  }

  async function syncTopic(id: string) {
    const btn = document.getElementById(`sync-${id}`)
    if (btn) btn.textContent = 'Syncing...'
    await fetch(`/api/topics/${id}/sync`, { method: 'POST' })
    if (btn) btn.textContent = 'Sync'
    fetchTopics()
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Awesome Tools</h1>
          <p className="text-gray-500 mt-1">
            Auto-generate awesome lists from OSSInsight data
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/docs"
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            API Docs
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
          >
            + New Topic
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={createTopic}
          className="mb-8 p-6 bg-white rounded-xl border"
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. kubernetes"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Language (optional)
              </label>
              <input
                type="text"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                placeholder="e.g. Go"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="A curated list of..."
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="past_24_hours">Past 24 hours</option>
              <option value="past_week">Past week</option>
              <option value="past_month">Past month</option>
              <option value="past_3_months">Past 3 months</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No topics yet</p>
          <p className="text-sm mt-1">
            Create one to start building your awesome list
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border hover:border-gray-300 transition"
            >
              <Link
                href={`/topics/${topic.id}`}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">{topic.name}</h2>
                  {topic.language && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                      {topic.language}
                    </span>
                  )}
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                    {topic.period.replace(/_/g, ' ')}
                  </span>
                </div>
                {topic.description && (
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {topic.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {topic._count.categories} categories
                  {topic.lastSyncAt &&
                    ` · synced ${new Date(topic.lastSyncAt).toLocaleDateString()}`}
                </p>
              </Link>
              <div className="flex items-center gap-2 ml-4">
                <button
                  id={`sync-${topic.id}`}
                  onClick={() => syncTopic(topic.id)}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Sync
                </button>
                <button
                  onClick={() => deleteTopic(topic.id)}
                  className="px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
