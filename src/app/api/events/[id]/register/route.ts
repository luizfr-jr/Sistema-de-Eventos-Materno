import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { eventService } from '@/services/event.service'
import { registrationSchema } from '@/lib/validators'
import { RegistrationStatus } from '@prisma/client'
import { ZodError } from 'zod'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * POST /api/events/[id]/register
 * Register user in an event
 * Requires authentication
 */
export async function POST(
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

    const eventId = params.id
    const userId = session.user.id!

    // Check if event exists
    const event = await eventService.getEventById(eventId)
    if (!event) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      )
    }

    // Check if registrations are allowed
    const { canRegister, reason } = await eventService.canRegister(eventId)
    if (!canRegister) {
      return NextResponse.json(
        { error: reason },
        { status: 400 }
      )
    }

    // Check if user is already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    })

    if (existingRegistration) {
      if (existingRegistration.status === RegistrationStatus.CANCELLED) {
        // Reactivate cancelled registration
        const registration = await prisma.registration.update({
          where: { id: existingRegistration.id },
          data: {
            status: event.requiresApproval
              ? RegistrationStatus.PENDING
              : RegistrationStatus.CONFIRMED,
            registeredAt: new Date(),
          },
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
                location: true,
              },
            },
          },
        })

        return NextResponse.json(
          {
            message: 'Inscrição reativada com sucesso',
            registration,
          },
          { status: 200 }
        )
      }

      return NextResponse.json(
        { error: 'Você já está inscrito neste evento' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = registrationSchema.parse({
      eventId,
      ...body,
    })

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId,
        notes: validatedData.notes,
        dietaryRestrictions: validatedData.dietaryRestrictions,
        status: event.requiresApproval
          ? RegistrationStatus.PENDING
          : RegistrationStatus.CONFIRMED,
        confirmed: !event.requiresApproval,
        confirmedAt: !event.requiresApproval ? new Date() : null,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            requiresApproval: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: event.requiresApproval
          ? 'Inscrição realizada! Aguarde a aprovação.'
          : 'Inscrição confirmada com sucesso!',
        registration,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error registering for event:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors
        },
        { status: 400 }
      )
    }

    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Você já está inscrito neste evento' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao realizar inscrição' },
      { status: 500 }
    )
  }
}
