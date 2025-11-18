import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { attendanceService } from '@/services/attendance.service'
import { UserRole } from '@prisma/client'
import { ZodError, z } from 'zod'

const checkoutSchema = z.object({
  registrationId: z.string().min(1, 'ID da inscrição é obrigatório'),
  notes: z.string().optional(),
})

/**
 * POST /api/attendances/checkout
 * Register check-out for a participant
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

    const userRole = (session.user as any).role
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.COORDINATOR) {
      return NextResponse.json(
        { error: 'Sem permissão para registrar check-out' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)

    const attendance = await attendanceService.checkout({
      registrationId: validatedData.registrationId,
      notes: validatedData.notes,
    })

    return NextResponse.json({
      success: true,
      message: 'Check-out realizado com sucesso',
      attendance,
    })
  } catch (error) {
    console.error('Error checking out:', error)

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
      { error: 'Erro ao registrar check-out' },
      { status: 500 }
    )
  }
}
