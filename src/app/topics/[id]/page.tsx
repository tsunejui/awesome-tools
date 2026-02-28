'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'

interface Repository {
  id: string
  repoName: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  url: string
}

interface Category {
  id: string
  name: string
  description: string | null
  order: number
  repositories: Repository[]
}

interface Topic {
  id: string
  name: string
  description: string | null
  language: string | null
  period: string
  lastSyncAt: string | null
  categories: Category[]
}

export default function TopicDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchTopic()
  }, [id])

  async function fetchTopic() {
    const res = await fetch(`/api/topics/${id}`)
    if (res.ok) setTopic(await res.json())
  }

  async function sync() {
    setSyncing(true)
    await fetch(`/api/topics/${id}/sync`, { method: 'POST' })
    setSyncing(false)
    fetchTopic()
  }

  async function generate() {
    const res = await fetch(`/api/topics/${id}/generate`)
    const data = await res.json()
    setMarkdown(data.markdown)
  }

  async function deleteCategory(catId: string) {
    if (!confirm('Delete this category and all its repos?')) return
    await fetch(`/api/categories/${catId}`, { method: 'DELETE' })
    fetchTopic()
  }

  async function deleteRepo(repoId: string) {
    await fetch(`/api/repositories?id=${repoId}`, { method: 'DELETE' })
    fetchTopic()
  }

  if (!topic) return <main className="max-w-5xl mx-auto p-8">Loading...</main>

  const totalRepos = topic.categories.reduce(
    (sum, c) => sum + c.repositories.length,
    0
  )

  return (
    <main className="max-w-5xl mx-auto p-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back to dashboard
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{topic.name}</h1>
          {topic.description && (
            <p className="text-gray-500 mt-1">{topic.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
            {topic.language && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                {topic.language}
              </span>
            )}
            <span>{topic.period.replace(/_/g, ' ')}</span>
            <span>{topic.categories.length} categories</span>
            <span>{totalRepos} repos</span>
            {topic.lastSyncAt && (
              <span>
                synced {new Date(topic.lastSyncAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={sync}
            disabled={syncing}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync from OSSInsight'}
          </button>
          <button
            onClick={generate}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Generate README
          </button>
        </div>
      </div>

      {markdown && (
        <div className="mb-8 p-6 bg-white rounded-xl border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Generated README</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(markdown)
                }}
                className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
              >
                Copy
              </button>
              <button
                onClick={() => setMarkdown(null)}
                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
          <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap">
            {markdown}
          </pre>
        </div>
      )}

      {topic.categories.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No categories yet</p>
          <p className="text-sm mt-1">
            Click &ldquo;Sync from OSSInsight&rdquo; to fetch repos
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {topic.categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-sm text-gray-500">{cat.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">
                    {cat.repositories.length} repos
                  </span>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-sm text-red-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="divide-y">
                {cat.repositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between px-6 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {repo.repoName}
                      </a>
                      {repo.description && (
                        <p className="text-sm text-gray-500 truncate">
                          {repo.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 ml-4 text-sm text-gray-400">
                      {repo.language && <span>{repo.language}</span>}
                      <span>
                        {repo.stars >= 1000
                          ? `${(repo.stars / 1000).toFixed(1)}k`
                          : repo.stars}{' '}
                        stars
                      </span>
                      <button
                        onClick={() => deleteRepo(repo.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
