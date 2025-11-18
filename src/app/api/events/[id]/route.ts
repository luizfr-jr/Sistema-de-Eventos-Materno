import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { eventService } from '@/services/event.service'
import { eventSchema, partialEventSchema } from '@/lib/validators'
import { UserRole } from '@prisma/client'
import { ZodError } from 'zod'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/events/[id]
 * Get a single event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const event = await eventService.getEventById(params.id)

    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Get event statistics
    const stats = await eventService.getEventStats(params.id)

    return NextResponse.json({ ...event, stats })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/events/[id]
 * Update an event
 * Requires ADMIN, COORDINATOR, or event creator
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Check if user can manage this event
    const canManage = await eventService.canUserManageEvent(
      session.user.id!,
      params.id
    )

    if (!canManage) {
      return NextResponse.json(
        { error: 'Sem permissão para editar este evento' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // For partial updates, we use the partial schema
    const validatedData = partialEventSchema.parse(body)

    // Convert string dates to Date objects if present
    const updateData: any = { ...validatedData }

    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate)
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate)
    }
    if (validatedData.registrationStart) {
      updateData.registrationStart = new Date(validatedData.registrationStart)
    }
    if (validatedData.registrationEnd) {
      updateData.registrationEnd = new Date(validatedData.registrationEnd)
    }
    if (validatedData.submissionStart) {
      updateData.submissionStart = new Date(validatedData.submissionStart)
    }
    if (validatedData.submissionEnd) {
      updateData.submissionEnd = new Date(validatedData.submissionEnd)
    }

    const event = await eventService.updateEvent(params.id, updateData)

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors
        },
        { status: 400 }
      )
    }

    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar evento' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/events/[id]
 * Delete an event
 * Requires ADMIN or COORDINATOR
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Only ADMIN and COORDINATOR can delete events
    const userRole = (session.user as any).role
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.COORDINATOR) {
      return NextResponse.json(
        { error: 'Sem permissão para excluir eventos' },
        { status: 403 }
      )
    }

    await eventService.deleteEvent(params.id)

    return NextResponse.json(
      { message: 'Evento excluído com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting event:', error)

    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao excluir evento' },
      { status: 500 }
    )
  }
}
