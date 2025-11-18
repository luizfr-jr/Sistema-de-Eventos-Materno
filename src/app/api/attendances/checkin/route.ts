import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { attendanceService } from '@/services/attendance.service'
import { AttendanceMethod, UserRole } from '@prisma/client'
import { ZodError, z } from 'zod'

const checkinSchema = z.object({
  registrationId: z.string().min(1, 'ID da inscrição é obrigatório'),
  method: z.nativeEnum(AttendanceMethod).optional().default(AttendanceMethod.MANUAL),
  location: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * POST /api/attendances/checkin
 * Register check-in for a participant
 * Requires authentication and ADMIN/COORDINATOR role
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

    const body = await request.json()
    const validatedData = checkinSchema.parse(body)

    // Get IP address and user agent
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    // Check if user can manage attendances
    const registration = await attendanceService.getAttendanceByRegistrationId(
      validatedData.registrationId
    )

    if (!registration) {
      const reg = await attendanceService['getAttendanceByRegistrationId'](
        validatedData.registrationId
      )
    }

    // For manual check-in, verify user has permission
    if (validatedData.method === AttendanceMethod.MANUAL) {
      const userRole = (session.user as any).role

      if (userRole !== UserRole.ADMIN && userRole !== UserRole.COORDINATOR) {
        return NextResponse.json(
          { error: 'Sem permissão para registrar presenças manualmente' },
          { status: 403 }
        )
      }
    }

    const attendance = await attendanceService.checkin({
      registrationId: validatedData.registrationId,
      method: validatedData.method,
      location: validatedData.location,
      ipAddress,
      userAgent,
      notes: validatedData.notes,
      recordedById: session.user.id,
    })

    return NextResponse.json({
      success: true,
      message: 'Check-in realizado com sucesso',
      attendance,
    })
  } catch (error) {
    console.error('Error checking in:', error)

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
      { error: 'Erro ao registrar check-in' },
      { status: 500 }
    )
  }
}
