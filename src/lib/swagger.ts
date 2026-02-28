import swaggerJsdoc from 'swagger-jsdoc'
import path from 'path'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Awesome Tools API',
      version: '1.0.0',
      description:
        'REST API for discovering, categorizing, and generating awesome lists from OSSInsight data.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local development' },
    ],
    tags: [
      { name: 'Topics', description: 'Topic management' },
      { name: 'Categories', description: 'Category management' },
      { name: 'Repositories', description: 'Repository data' },
      { name: 'Sync', description: 'OSSInsight data sync' },
      { name: 'Generate', description: 'README generation' },
    ],
  },
  apis: [path.join(process.cwd(), 'src/app/api/**/*.ts')],
}

export const getApiDocs = () => swaggerJsdoc(options)
