import { prisma } from './prisma'

interface RepoData {
  repoName: string
  description: string | null
  stars: number
  url: string
}

interface CategoryData {
  name: string
  description: string | null
  repositories: RepoData[]
}

export async function generateReadme(topicId: string): Promise<string> {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      categories: {
        orderBy: { order: 'asc' },
        include: {
          repositories: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  if (!topic) throw new Error(`Topic not found: ${topicId}`)

  return formatMarkdown(topic.name, topic.description, topic.categories)
}

function formatMarkdown(
  name: string,
  description: string | null,
  categories: CategoryData[]
): string {
  const lines: string[] = []

  const title = name.charAt(0).toUpperCase() + name.slice(1)
  lines.push(`# Awesome ${title}`)
  lines.push('')

  if (description) {
    lines.push(`> ${description}`)
    lines.push('')
  }

  lines.push(
    'A curated list of awesome tools and resources. Auto-generated from [OSSInsight](https://ossinsight.io/) data.'
  )
  lines.push('')

  // Table of Contents
  if (categories.length > 1) {
    lines.push('## Contents')
    lines.push('')
    for (const cat of categories) {
      const anchor = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      lines.push(`- [${cat.name}](#${anchor})`)
    }
    lines.push('')
  }

  // Categories
  for (const cat of categories) {
    lines.push(`## ${cat.name}`)
    lines.push('')
    if (cat.description) {
      lines.push(`${cat.description}`)
      lines.push('')
    }
    for (const repo of cat.repositories) {
      const desc = repo.description ? ` - ${repo.description}` : ''
      const stars = repo.stars > 0 ? ` ⭐ ${formatStars(repo.stars)}` : ''
      lines.push(`- [${repo.repoName}](${repo.url})${desc}${stars}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push(
    `*Generated on ${new Date().toISOString().split('T')[0]} by [awesome-tools](https://github.com/rex/awesome-tools)*`
  )
  lines.push('')

  return lines.join('\n')
}

function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`
  }
  return String(stars)
}
