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
 * GET /api/events/[id]/attendances/export
 * Export attendance list to CSV
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
        { error: 'Sem permissão para exportar dados' },
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

    const csv = await attendanceService.exportAttendanceToCSV(params.id)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="presencas-${params.id}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting attendances:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar dados' },
      { status: 500 }
    )
  }
}
