import { getApiDocs } from '@/lib/swagger'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: OpenAPI specification
 *     responses:
 *       200:
 *         description: OpenAPI JSON
 */
export function GET() {
  return NextResponse.json(getApiDocs())
}
