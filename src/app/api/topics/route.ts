import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

/**
 * @swagger
 * /api/topics:
 *   get:
 *     tags: [Topics]
 *     summary: List all topics
 *     responses:
 *       200:
 *         description: Array of topics
 *   post:
 *     tags: [Topics]
 *     summary: Create a new topic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               language: { type: string }
 *               period: { type: string, enum: [past_24_hours, past_week, past_month, past_3_months] }
 *     responses:
 *       201:
 *         description: Created
 */
export async function GET() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { categories: true } },
    },
  })
  return NextResponse.json(topics)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const topic = await prisma.topic.create({
    data: {
      name: body.name,
      description: body.description,
      language: body.language,
      period: body.period ?? 'past_month',
    },
  })
  return NextResponse.json(topic, { status: 201 })
}
