import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

/**
 * @swagger
 * /api/topics/{id}:
 *   get:
 *     tags: [Topics]
 *     summary: Get a topic by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Topic with categories and repos
 *       404:
 *         description: Not found
 *   patch:
 *     tags: [Topics]
 *     summary: Update a topic
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               language: { type: string }
 *               period: { type: string }
 *     responses:
 *       200:
 *         description: Updated topic
 *   delete:
 *     tags: [Topics]
 *     summary: Delete a topic
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      categories: {
        orderBy: { order: 'asc' },
        include: {
          repositories: { orderBy: { stars: 'desc' } },
        },
      },
    },
  })
  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(topic)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const topic = await prisma.topic.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      language: body.language,
      period: body.period,
    },
  })
  return NextResponse.json(topic)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.topic.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
