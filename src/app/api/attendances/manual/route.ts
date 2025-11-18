import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { attendanceService } from '@/services/attendance.service'
import { AttendanceMethod, UserRole } from '@prisma/client'
import { ZodError, z } from 'zod'

const manualCheckinSchema = z.object({
  eventId: z.string().min(1, 'ID do evento é obrigatório'),
  registrationIds: z.array(z.string()).min(1, 'Pelo menos uma inscrição deve ser selecionada'),
  location: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * POST /api/attendances/manual
 * Manual check-in for one or more participants by coordinator
 * Requires ADMIN or COORDINATOR role
 */
export async function POST(request: NextRequest) {
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
        { error: 'Sem permissão para registrar presenças' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = manualCheckinSchema.parse(body)

    // Verify user can manage this event
    const canManage = await attendanceService.canUserManageAttendances(
      session.user.id!,
      validatedData.eventId
    )

    if (!canManage) {
      return NextResponse.json(
        { error: 'Sem permissão para gerenciar presenças deste evento' },
        { status: 403 }
      )
    }

    // Perform bulk check-in
    const results = await attendanceService.bulkCheckin(
      validatedData.registrationIds,
      AttendanceMethod.MANUAL,
      session.user.id
    )

    return NextResponse.json({
      success: true,
      message: `Check-in realizado: ${results.success.length} sucesso, ${results.failed.length} falhas`,
      results,
    })
  } catch (error) {
    console.error('Error in manual check-in:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao registrar presenças' },
      { status: 500 }
    )
  }
}
