import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List categories (optionally filter by topicId)
 *     parameters:
 *       - in: query
 *         name: topicId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of categories
 *   post:
 *     tags: [Categories]
 *     summary: Create a category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [topicId, name]
 *             properties:
 *               topicId: { type: string }
 *               name: { type: string }
 *               description: { type: string }
 *               order: { type: integer }
 *     responses:
 *       201:
 *         description: Created
 */
export async function GET(req: NextRequest) {
  const topicId = req.nextUrl.searchParams.get('topicId')
  const where = topicId ? { topicId } : {}
  const categories = await prisma.category.findMany({
    where,
    orderBy: { order: 'asc' },
    include: { _count: { select: { repositories: true } } },
  })
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const category = await prisma.category.create({
    data: {
      topicId: body.topicId,
      name: body.name,
      description: body.description,
      order: body.order ?? 0,
    },
  })
  return NextResponse.json(category, { status: 201 })
}
