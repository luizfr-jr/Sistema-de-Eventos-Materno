import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { attendanceService } from '@/services/attendance.service'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: {
    id: string
  }
}

/**
 * DELETE /api/attendances/[id]
 * Delete an attendance record (undo check-in)
 * Requires authentication and ADMIN/COORDINATOR role
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
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
        { error: 'Sem permissão para remover presenças' },
        { status: 403 }
      )
    }

    // Get registration to check event permissions
    const registration = await prisma.registration.findUnique({
      where: { id: params.id },
      select: {
        eventId: true,
      },
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      )
    }

    // Check if user can manage this event
    const canManage = await attendanceService.canUserManageAttendances(
      session.user.id!,
      registration.eventId
    )

    if (!canManage) {
      return NextResponse.json(
        { error: 'Sem permissão para gerenciar este evento' },
        { status: 403 }
      )
    }

    await attendanceService.deleteAttendance(params.id)

    return NextResponse.json({
      success: true,
      message: 'Check-in removido com sucesso',
    })
  } catch (error) {
    console.error('Error deleting attendance:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao remover check-in' },
      { status: 500 }
    )
  }
}
