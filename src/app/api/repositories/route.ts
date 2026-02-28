import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

/**
 * @swagger
 * /api/repositories:
 *   get:
 *     tags: [Repositories]
 *     summary: List repositories (filter by categoryId)
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of repositories
 *   post:
 *     tags: [Repositories]
 *     summary: Add a repository to a category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, repoName, url]
 *             properties:
 *               categoryId: { type: string }
 *               repoName: { type: string }
 *               description: { type: string }
 *               language: { type: string }
 *               stars: { type: integer }
 *               forks: { type: integer }
 *               url: { type: string }
 *               order: { type: integer }
 *     responses:
 *       201:
 *         description: Created
 *   delete:
 *     tags: [Repositories]
 *     summary: Delete a repository by ID
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 */
export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get('categoryId')
  const where = categoryId ? { categoryId } : {}
  const repos = await prisma.repository.findMany({
    where,
    orderBy: { stars: 'desc' },
  })
  return NextResponse.json(repos)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const repo = await prisma.repository.create({
    data: {
      categoryId: body.categoryId,
      repoName: body.repoName,
      description: body.description,
      language: body.language,
      stars: body.stars ?? 0,
      forks: body.forks ?? 0,
      url: body.url,
      order: body.order ?? 0,
    },
  })
  return NextResponse.json(repo, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await prisma.repository.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
