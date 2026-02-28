import { prisma } from '@/lib/prisma'
import { fetchTrendingRepos, fetchCollections, fetchCollectionRepos } from '@/lib/ossinsight'
import { NextRequest, NextResponse } from 'next/server'

/**
 * @swagger
 * /api/topics/{id}/sync:
 *   post:
 *     tags: [Sync]
 *     summary: Sync repos from OSSInsight for a topic
 *     description: Fetches trending repos and matching collections from OSSInsight, auto-categorizes by language/collection, and upserts into the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sync results
 *       404:
 *         description: Topic not found
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const topic = await prisma.topic.findUnique({ where: { id } })
  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let synced = 0

  // 1. Fetch trending repos
  try {
    const trending = await fetchTrendingRepos({
      period: topic.period,
      language: topic.language ?? undefined,
    })

    // Group by language
    const byLang = new Map<string, typeof trending>()
    for (const repo of trending) {
      const lang = repo.primary_language || 'Other'
      if (!byLang.has(lang)) byLang.set(lang, [])
      byLang.get(lang)!.push(repo)
    }

    for (const [lang, repos] of byLang) {
      const category = await prisma.category.upsert({
        where: { topicId_name: { topicId: id, name: lang } },
        create: { topicId: id, name: lang },
        update: {},
      })

      for (const repo of repos) {
        await prisma.repository.upsert({
          where: {
            categoryId_repoName: {
              categoryId: category.id,
              repoName: repo.repo_name,
            },
          },
          create: {
            categoryId: category.id,
            repoName: repo.repo_name,
            description: repo.description,
            language: repo.primary_language,
            stars: repo.stars,
            forks: repo.forks,
            url: `https://github.com/${repo.repo_name}`,
          },
          update: {
            description: repo.description,
            stars: repo.stars,
            forks: repo.forks,
          },
        })
        synced++
      }
    }
  } catch (e) {
    console.error('Error fetching trending repos:', e)
  }

  // 2. Fetch matching collections
  try {
    const collections = await fetchCollections()
    const matching = collections.filter((c) =>
      c.name.toLowerCase().includes(topic.name.toLowerCase())
    )

    for (const collection of matching.slice(0, 5)) {
      const repos = await fetchCollectionRepos(collection.id)
      const category = await prisma.category.upsert({
        where: { topicId_name: { topicId: id, name: collection.name } },
        create: {
          topicId: id,
          name: collection.name,
          description: `From OSSInsight collection: ${collection.name}`,
        },
        update: {},
      })

      for (const repo of repos) {
        await prisma.repository.upsert({
          where: {
            categoryId_repoName: {
              categoryId: category.id,
              repoName: repo.repo_name,
            },
          },
          create: {
            categoryId: category.id,
            repoName: repo.repo_name,
            description: repo.description,
            language: repo.primary_language,
            stars: repo.stars,
            forks: repo.forks,
            url: `https://github.com/${repo.repo_name}`,
          },
          update: {
            description: repo.description,
            stars: repo.stars,
            forks: repo.forks,
          },
        })
        synced++
      }
    }
  } catch (e) {
    console.error('Error fetching collections:', e)
  }

  // Update lastSyncAt
  await prisma.topic.update({
    where: { id },
    data: { lastSyncAt: new Date() },
  })

  return NextResponse.json({ synced, lastSyncAt: new Date().toISOString() })
}
