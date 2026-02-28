import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding: example topic (kubernetes)')

  // Clear existing data
  await prisma.repository.deleteMany()
  await prisma.category.deleteMany()
  await prisma.topic.deleteMany()

  const topic = await prisma.topic.create({
    data: {
      name: 'kubernetes',
      description: 'A curated list of awesome Kubernetes tools and resources',
      language: 'Go',
      period: 'past_month',
      categories: {
        create: [
          {
            name: 'CLI Tools',
            description: 'Command-line tools for Kubernetes',
            order: 0,
            repositories: {
              create: [
                {
                  repoName: 'derailed/k9s',
                  description: 'Kubernetes CLI To Manage Your Clusters In Style!',
                  language: 'Go',
                  stars: 27000,
                  forks: 1700,
                  url: 'https://github.com/derailed/k9s',
                  order: 0,
                },
                {
                  repoName: 'ahmetb/kubectx',
                  description: 'Faster way to switch between clusters and namespaces in kubectl',
                  language: 'Go',
                  stars: 17000,
                  forks: 1200,
                  url: 'https://github.com/ahmetb/kubectx',
                  order: 1,
                },
              ],
            },
          },
          {
            name: 'Networking',
            description: 'Kubernetes networking tools',
            order: 1,
            repositories: {
              create: [
                {
                  repoName: 'cilium/cilium',
                  description: 'eBPF-based Networking, Security, and Observability',
                  language: 'Go',
                  stars: 20000,
                  forks: 2900,
                  url: 'https://github.com/cilium/cilium',
                  order: 0,
                },
              ],
            },
          },
          {
            name: 'Monitoring',
            description: 'Monitoring and observability tools',
            order: 2,
            repositories: {
              create: [
                {
                  repoName: 'prometheus/prometheus',
                  description: 'The Prometheus monitoring system and time series database',
                  language: 'Go',
                  stars: 55000,
                  forks: 9100,
                  url: 'https://github.com/prometheus/prometheus',
                  order: 0,
                },
                {
                  repoName: 'grafana/grafana',
                  description: 'The open and composable observability and data visualization platform',
                  language: 'TypeScript',
                  stars: 64000,
                  forks: 12000,
                  url: 'https://github.com/grafana/grafana',
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log(`Created topic: ${topic.name} (${topic.id})`)
  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
