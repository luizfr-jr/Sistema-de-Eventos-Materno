import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { eventService } from '@/services/event.service'
import { eventSchema } from '@/lib/validators'
import { UserRole, EventStatus, EventType } from '@prisma/client'
import { ZodError } from 'zod'

/**
 * GET /api/events
 * List all events with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') as EventStatus | null
    const type = searchParams.get('type') as EventType | null
    const search = searchParams.get('search') || undefined
    const isOnline = searchParams.get('isOnline')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const orderBy = searchParams.get('orderBy') || 'startDate'
    const order = searchParams.get('order') || 'desc'

    // Build filters
    const filters: any = {
      ...(status && { status }),
      ...(type && { type }),
      ...(search && { search }),
      ...(isOnline !== null && { isOnline: isOnline === 'true' }),
      ...(tags && tags.length > 0 && { tags }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    }

    // Build orderBy
    const orderByObj: any = {}
    orderByObj[orderBy] = order

    const result = await eventService.listEvents(filters, page, limit, orderByObj)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar eventos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events
 * Create a new event
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

    // Check if user has permission to create events
    const userRole = (session.user as any).role
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.COORDINATOR) {
      return NextResponse.json(
        { error: 'Sem permissão para criar eventos' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = eventSchema.parse(body)

    // Convert string dates to Date objects
    const eventData = {
      ...validatedData,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      registrationStart: validatedData.registrationStart
        ? new Date(validatedData.registrationStart)
        : undefined,
      registrationEnd: validatedData.registrationEnd
        ? new Date(validatedData.registrationEnd)
        : undefined,
      submissionStart: validatedData.submissionStart
        ? new Date(validatedData.submissionStart)
        : undefined,
      submissionEnd: validatedData.submissionEnd
        ? new Date(validatedData.submissionEnd)
        : undefined,
      createdById: session.user.id!,
      status: EventStatus.DRAFT,
    }

    const event = await eventService.createEvent(eventData)

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar evento' },
      { status: 500 }
    )
  }
}
