import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const topicName = process.argv[2]
  if (!topicName) {
    console.error('Usage: npx tsx scripts/generate-readme.ts <topic-name>')
    process.exit(1)
  }

  const topic = await prisma.topic.findUnique({
    where: { name: topicName },
    include: {
      categories: {
        orderBy: { order: 'asc' },
        include: {
          repositories: { orderBy: { stars: 'desc' } },
        },
      },
    },
  })

  if (!topic) {
    console.error(`Topic not found: ${topicName}`)
    process.exit(1)
  }

  // Generate markdown
  const lines: string[] = []
  const title = topic.name.charAt(0).toUpperCase() + topic.name.slice(1)
  lines.push(`# Awesome ${title}`)
  lines.push('')

  if (topic.description) {
    lines.push(`> ${topic.description}`)
    lines.push('')
  }

  lines.push(
    'A curated list of awesome tools and resources. Auto-generated from [OSSInsight](https://ossinsight.io/) data.'
  )
  lines.push('')

  if (topic.categories.length > 1) {
    lines.push('## Contents')
    lines.push('')
    for (const cat of topic.categories) {
      const anchor = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      lines.push(`- [${cat.name}](#${anchor})`)
    }
    lines.push('')
  }

  for (const cat of topic.categories) {
    lines.push(`## ${cat.name}`)
    lines.push('')
    if (cat.description) {
      lines.push(`${cat.description}`)
      lines.push('')
    }
    for (const repo of cat.repositories) {
      const desc = repo.description ? ` - ${repo.description}` : ''
      let stars = ''
      if (repo.stars > 0) {
        const formatted =
          repo.stars >= 1000
            ? `${(repo.stars / 1000).toFixed(1)}k`
            : String(repo.stars)
        stars = ` ⭐ ${formatted}`
      }
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

  console.log(lines.join('\n'))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
