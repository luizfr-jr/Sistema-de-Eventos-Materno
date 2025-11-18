import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { attendanceService } from '@/services/attendance.service'
import { UserRole } from '@prisma/client'

interface RouteContext {
  params: {
    id: string
  }
}

/**
 * GET /api/events/[id]/attendances/stats
 * Get attendance statistics for an event
 * Requires authentication and permission to manage event
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userRole = (session.user as any).role
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.COORDINATOR) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar estatísticas' },
        { status: 403 }
      )
    }

    // Check if user can manage this event
    const canManage = await attendanceService.canUserManageAttendances(
      session.user.id!,
      params.id
    )

    if (!canManage) {
      return NextResponse.json(
        { error: 'Sem permissão para gerenciar este evento' },
        { status: 403 }
      )
    }

    const stats = await attendanceService.getEventAttendanceStats(params.id)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching attendance stats:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
