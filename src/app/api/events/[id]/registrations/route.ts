import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { eventService } from '@/services/event.service'
import { RegistrationStatus } from '@prisma/client'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/events/[id]/registrations
 * List all registrations for an event
 * Requires ADMIN, COORDINATOR, or event creator
 */
export async function GET(
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

    // Check if user can manage this event
    const canManage = await eventService.canUserManageEvent(
      session.user.id!,
      eventId
    )

    if (!canManage) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar inscrições deste evento' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') as RegistrationStatus | null
    const search = searchParams.get('search') || undefined

    // Build where clause
    const where: any = { eventId }

    if (status) {
      where.status = status
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    // Fetch registrations with pagination
    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              institution: true,
              course: true,
              image: true,
            },
          },
          attendance: true,
          certificate: true,
        },
        orderBy: { registeredAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.registration.count({ where }),
    ])

    // Get summary statistics
    const [
      totalRegistrations,
      confirmedCount,
      pendingCount,
      cancelledCount,
      attendedCount,
    ] = await Promise.all([
      prisma.registration.count({ where: { eventId } }),
      prisma.registration.count({
        where: { eventId, status: RegistrationStatus.CONFIRMED }
      }),
      prisma.registration.count({
        where: { eventId, status: RegistrationStatus.PENDING }
      }),
      prisma.registration.count({
        where: { eventId, status: RegistrationStatus.CANCELLED }
      }),
      prisma.registration.count({
        where: { eventId, status: RegistrationStatus.ATTENDED }
      }),
    ])

    return NextResponse.json({
      registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        total: totalRegistrations,
        confirmed: confirmedCount,
        pending: pendingCount,
        cancelled: cancelledCount,
        attended: attendedCount,
      },
    })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar inscrições' },
      { status: 500 }
    )
  }
}
