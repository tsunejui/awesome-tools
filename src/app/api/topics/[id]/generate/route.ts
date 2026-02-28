import { generateReadme } from '@/lib/readme-generator'
import { NextRequest, NextResponse } from 'next/server'

/**
 * @swagger
 * /api/topics/{id}/generate:
 *   get:
 *     tags: [Generate]
 *     summary: Generate a README.md for a topic
 *     description: Queries all categories and repos for the topic and returns formatted awesome-list markdown.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Generated markdown
 *         content:
 *           text/markdown: {}
 *           application/json: {}
 *       404:
 *         description: Topic not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const markdown = await generateReadme(id)

    const accept = req.headers.get('accept') || ''
    if (accept.includes('text/markdown') || accept.includes('text/plain')) {
      return new NextResponse(markdown, {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      })
    }

    return NextResponse.json({ markdown })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 404 })
  }
}
