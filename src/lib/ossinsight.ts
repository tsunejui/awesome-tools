const BASE_URL = 'https://api.ossinsight.io/v1'

export interface TrendingRepo {
  repo_name: string
  description: string | null
  primary_language: string | null
  stars: number
  forks: number
  repo_id: number
}

export interface Collection {
  id: number
  name: string
  slug: string
}

export interface CollectionRepo {
  repo_name: string
  description: string | null
  primary_language: string | null
  stars: number
  forks: number
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`OSSInsight API error: ${res.status} ${res.statusText}`)
  }
  const json = await res.json()
  return json.data ?? json
}

export async function fetchTrendingRepos(params: {
  period?: string
  language?: string
}): Promise<TrendingRepo[]> {
  const searchParams = new URLSearchParams()
  if (params.period) searchParams.set('period', params.period)
  if (params.language) searchParams.set('language', params.language)

  const url = `${BASE_URL}/trends/repos?${searchParams}`
  return fetchJSON<TrendingRepo[]>(url)
}

export async function fetchCollections(): Promise<Collection[]> {
  return fetchJSON<Collection[]>(`${BASE_URL}/collections`)
}

export async function fetchCollectionRepos(
  collectionId: number
): Promise<CollectionRepo[]> {
  return fetchJSON<CollectionRepo[]>(
    `${BASE_URL}/collections/${collectionId}/repos`
  )
}
