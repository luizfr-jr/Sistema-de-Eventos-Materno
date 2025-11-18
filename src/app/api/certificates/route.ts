import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { certificateService } from '@/services/certificate.service'
import { UserRole } from '@prisma/client'

/**
 * GET /api/certificates
 * List certificates
 * - Regular users see only their own certificates
 * - ADMIN/COORDINATOR see all certificates
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams

    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const eventId = searchParams.get('eventId') || undefined
    const role = searchParams.get('role') || undefined

    const userRole = (session.user as any).role

    // Build filters
    let filters: any = {
      ...(eventId && { eventId }),
      ...(role && { role }),
    }

    // Regular users can only see their own certificates
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.COORDINATOR) {
      filters.userId = session.user.id
    } else if (searchParams.get('userId')) {
      // ADMIN/COORDINATOR can filter by userId
      filters.userId = searchParams.get('userId') || undefined
    }

    const result = await certificateService.listCertificates(
      filters,
      page,
      limit
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar certificados' },
      { status: 500 }
    )
  }
}
