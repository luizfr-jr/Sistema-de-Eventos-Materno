import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { EventStatus, EventType, UserRole, Prisma } from '@prisma/client'

export interface CreateEventData {
  title: string
  description: string
  shortDesc?: string
  type: EventType
  status?: EventStatus
  startDate: Date
  endDate: Date
  location: string
  address?: string
  city?: string
  state?: string
  isOnline: boolean
  meetingUrl?: string
  capacity?: number
  allowRegistrations: boolean
  registrationStart?: Date
  registrationEnd?: Date
  requiresApproval?: boolean
  allowSubmissions: boolean
  submissionStart?: Date
  submissionEnd?: Date
  submissionGuidelines?: string
  issueCertificates: boolean
  certificateTemplate?: string
  workload?: number
  image?: string
  banner?: string
  tags?: string[]
  keywords?: string[]
  createdById: string
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export interface EventFilters {
  status?: EventStatus
  type?: EventType
  search?: string
  startDate?: Date
  endDate?: Date
  isOnline?: boolean
  tags?: string[]
}

export class EventService {
  /**
   * Create a new event
   */
  async createEvent(data: CreateEventData) {
    // Generate unique slug
    let slug = slugify(data.title)
    let count = 0

    while (await this.isSlugTaken(slug)) {
      count++
      slug = `${slugify(data.title)}-${count}`
    }

    return prisma.event.create({
      data: {
        ...data,
        slug,
        publishedAt: data.status === EventStatus.OPEN ? new Date() : null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            submissions: true,
          },
        },
      },
    })
  }

  /**
   * Update an event
   */
  async updateEvent(id: string, data: UpdateEventData) {
    const updateData: any = { ...data }

    // Update slug if title changed
    if (data.title) {
      let slug = slugify(data.title)
      let count = 0

      while (await this.isSlugTaken(slug, id)) {
        count++
        slug = `${slugify(data.title)}-${count}`
      }
      updateData.slug = slug
    }

    // Set publishedAt when changing to OPEN status
    if (data.status === EventStatus.OPEN) {
      const event = await prisma.event.findUnique({
        where: { id },
        select: { publishedAt: true },
      })

      if (!event?.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    return prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            submissions: true,
          },
        },
      },
    })
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string) {
    return prisma.event.delete({
      where: { id },
    })
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        schedules: {
          orderBy: {
            startTime: 'asc',
          },
        },
        _count: {
          select: {
            registrations: true,
            submissions: true,
            certificates: true,
          },
        },
      },
    })
  }

  /**
   * Get event by slug
   */
  async getEventBySlug(slug: string) {
    return prisma.event.findUnique({
      where: { slug },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        schedules: {
          orderBy: {
            startTime: 'asc',
          },
        },
        _count: {
          select: {
            registrations: true,
            submissions: true,
            certificates: true,
          },
        },
      },
    })
  }

  /**
   * List events with filters and pagination
   */
  async listEvents(
    filters: EventFilters = {},
    page = 1,
    limit = 10,
    orderBy: Prisma.EventOrderByWithRelationInput = { startDate: 'desc' }
  ) {
    const where: Prisma.EventWhereInput = {}

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { shortDesc: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.startDate) {
      where.startDate = { gte: filters.startDate }
    }

    if (filters.endDate) {
      where.endDate = { lte: filters.endDate }
    }

    if (filters.isOnline !== undefined) {
      where.isOnline = filters.isOnline
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              registrations: true,
              submissions: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ])

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get user's events (created by them)
   */
  async getUserEvents(userId: string, page = 1, limit = 10) {
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: { createdById: userId },
        include: {
          _count: {
            select: {
              registrations: true,
              submissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where: { createdById: userId } }),
    ])

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Check if user can manage event (creator, admin, or coordinator)
   */
  async canUserManageEvent(userId: string, eventId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user) return false
    if (user.role === UserRole.ADMIN) return true

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { createdById: true },
    })

    if (!event) return false

    return event.createdById === userId || user.role === UserRole.COORDINATOR
  }

  /**
   * Check if event is accepting registrations
   */
  async canRegister(eventId: string): Promise<{ canRegister: boolean; reason?: string }> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    })

    if (!event) {
      return { canRegister: false, reason: 'Evento não encontrado' }
    }

    if (!event.allowRegistrations) {
      return { canRegister: false, reason: 'Inscrições não permitidas' }
    }

    if (event.status !== EventStatus.OPEN) {
      return { canRegister: false, reason: 'Evento não está aberto para inscrições' }
    }

    if (event.registrationStart && new Date() < event.registrationStart) {
      return { canRegister: false, reason: 'Período de inscrições ainda não começou' }
    }

    if (event.registrationEnd && new Date() > event.registrationEnd) {
      return { canRegister: false, reason: 'Período de inscrições encerrado' }
    }

    if (event.capacity && event._count.registrations >= event.capacity) {
      return { canRegister: false, reason: 'Evento com capacidade máxima atingida' }
    }

    return { canRegister: true }
  }

  /**
   * Get event statistics
   */
  async getEventStats(eventId: string) {
    const [
      totalRegistrations,
      confirmedRegistrations,
      pendingRegistrations,
      cancelledRegistrations,
      totalSubmissions,
      totalCertificates,
    ] = await Promise.all([
      prisma.registration.count({ where: { eventId } }),
      prisma.registration.count({
        where: { eventId, status: 'CONFIRMED' }
      }),
      prisma.registration.count({
        where: { eventId, status: 'PENDING' }
      }),
      prisma.registration.count({
        where: { eventId, status: 'CANCELLED' }
      }),
      prisma.submission.count({ where: { eventId } }),
      prisma.certificate.count({ where: { eventId } }),
    ])

    return {
      registrations: {
        total: totalRegistrations,
        confirmed: confirmedRegistrations,
        pending: pendingRegistrations,
        cancelled: cancelledRegistrations,
      },
      submissions: totalSubmissions,
      certificates: totalCertificates,
    }
  }

  /**
   * Check if slug is already taken
   */
  private async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const event = await prisma.event.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    })
    return !!event
  }

  /**
   * Get upcoming events (public)
   */
  async getUpcomingEvents(limit = 10) {
    return prisma.event.findMany({
      where: {
        status: EventStatus.OPEN,
        startDate: { gte: new Date() },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    })
  }

  /**
   * Get popular events (by registrations)
   */
  async getPopularEvents(limit = 10) {
    return prisma.event.findMany({
      where: {
        status: EventStatus.OPEN,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        registrations: {
          _count: 'desc',
        },
      },
      take: limit,
    })
  }
}

export const eventService = new EventService()
