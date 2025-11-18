import { prisma } from '@/lib/prisma'
import { generateVerificationCode, formatDate } from '@/lib/utils'
import { UserRole, Prisma } from '@prisma/client'
import { addYears } from 'date-fns'

export interface CreateCertificateData {
  registrationId: string
  eventId: string
  userId: string
  workload: number
  role?: string
}

export interface CertificateFilters {
  eventId?: string
  userId?: string
  role?: string
  startDate?: Date
  endDate?: Date
}

export class CertificateService {
  /**
   * Generate a single certificate for a registration
   */
  async generateCertificate(data: CreateCertificateData) {
    // Check if certificate already exists for this registration
    const existing = await prisma.certificate.findUnique({
      where: { registrationId: data.registrationId },
    })

    if (existing) {
      throw new Error('Certificado já existe para esta inscrição')
    }

    // Verify registration exists and is confirmed
    const registration = await prisma.registration.findUnique({
      where: { id: data.registrationId },
      include: {
        event: true,
        user: true,
      },
    })

    if (!registration) {
      throw new Error('Inscrição não encontrada')
    }

    if (registration.status !== 'CONFIRMED' && registration.status !== 'ATTENDED') {
      throw new Error('Apenas inscrições confirmadas ou com presença podem receber certificado')
    }

    // Check if event issues certificates
    if (!registration.event.issueCertificates) {
      throw new Error('Este evento não emite certificados')
    }

    // Generate verification code with date
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase()
    const verificationCode = `NINMA-${dateStr}-${randomPart}`

    // Determine validity (5 years from issue date)
    const validUntil = addYears(date, 5)

    return prisma.certificate.create({
      data: {
        registrationId: data.registrationId,
        eventId: data.eventId,
        userId: data.userId,
        verificationCode,
        workload: data.workload,
        role: data.role || 'Participante',
        validUntil,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            workload: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            institution: true,
          },
        },
        registration: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })
  }

  /**
   * Generate certificates for all confirmed participants of an event
   */
  async generateEventCertificates(eventId: string, options?: { role?: string }) {
    // Get event and verify it issues certificates
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new Error('Evento não encontrado')
    }

    if (!event.issueCertificates) {
      throw new Error('Este evento não emite certificados')
    }

    // Get all confirmed registrations without certificates
    const registrations = await prisma.registration.findMany({
      where: {
        eventId,
        OR: [
          { status: 'CONFIRMED' },
          { status: 'ATTENDED' },
        ],
        certificate: null, // Only registrations without certificate
      },
      include: {
        user: true,
      },
    })

    if (registrations.length === 0) {
      return {
        generated: 0,
        certificates: [],
        message: 'Nenhum certificado para gerar',
      }
    }

    const certificates = []
    const errors = []

    for (const registration of registrations) {
      try {
        const certificate = await this.generateCertificate({
          registrationId: registration.id,
          eventId: eventId,
          userId: registration.userId,
          workload: event.workload || 0,
          role: options?.role || 'Participante',
        })
        certificates.push(certificate)
      } catch (error) {
        errors.push({
          registrationId: registration.id,
          userName: registration.user.name,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        })
      }
    }

    return {
      generated: certificates.length,
      certificates,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  /**
   * Get certificate by ID
   */
  async getCertificateById(id: string) {
    return prisma.certificate.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            workload: true,
            type: true,
            createdBy: {
              select: {
                name: true,
                institution: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            institution: true,
            cpf: true,
          },
        },
        registration: {
          select: {
            id: true,
            status: true,
            confirmedAt: true,
          },
        },
      },
    })
  }

  /**
   * Get certificate by verification code
   */
  async getCertificateByCode(verificationCode: string) {
    return prisma.certificate.findUnique({
      where: { verificationCode },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            workload: true,
            type: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            institution: true,
          },
        },
      },
    })
  }

  /**
   * List certificates with filters and pagination
   */
  async listCertificates(
    filters: CertificateFilters = {},
    page = 1,
    limit = 10,
    orderBy: Prisma.CertificateOrderByWithRelationInput = { issuedAt: 'desc' }
  ) {
    const where: Prisma.CertificateWhereInput = {}

    if (filters.eventId) {
      where.eventId = filters.eventId
    }

    if (filters.userId) {
      where.userId = filters.userId
    }

    if (filters.role) {
      where.role = filters.role
    }

    if (filters.startDate && filters.endDate) {
      where.issuedAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      }
    } else if (filters.startDate) {
      where.issuedAt = { gte: filters.startDate }
    } else if (filters.endDate) {
      where.issuedAt = { lte: filters.endDate }
    }

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              type: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              institution: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.certificate.count({ where }),
    ])

    return {
      certificates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get user's certificates
   */
  async getUserCertificates(userId: string, page = 1, limit = 10) {
    return this.listCertificates({ userId }, page, limit)
  }

  /**
   * Get event certificates
   */
  async getEventCertificates(eventId: string, page = 1, limit = 10) {
    return this.listCertificates({ eventId }, page, limit)
  }

  /**
   * Verify certificate validity
   */
  async verifyCertificate(verificationCode: string) {
    const certificate = await this.getCertificateByCode(verificationCode)

    if (!certificate) {
      return {
        valid: false,
        reason: 'Certificado não encontrado',
      }
    }

    const now = new Date()

    // Check if expired
    if (certificate.validUntil && now > certificate.validUntil) {
      return {
        valid: false,
        reason: 'Certificado expirado',
        certificate,
      }
    }

    return {
      valid: true,
      certificate,
    }
  }

  /**
   * Delete certificate
   */
  async deleteCertificate(id: string) {
    return prisma.certificate.delete({
      where: { id },
    })
  }

  /**
   * Update certificate PDF URL
   */
  async updateCertificatePdfUrl(id: string, pdfUrl: string) {
    return prisma.certificate.update({
      where: { id },
      data: { pdfUrl },
    })
  }

  /**
   * Check if user can manage certificates (ADMIN or COORDINATOR)
   */
  async canUserManageCertificates(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user) return false
    return user.role === UserRole.ADMIN || user.role === UserRole.COORDINATOR
  }

  /**
   * Get certificate statistics for an event
   */
  async getEventCertificateStats(eventId: string) {
    const [total, byRole] = await Promise.all([
      prisma.certificate.count({ where: { eventId } }),
      prisma.certificate.groupBy({
        by: ['role'],
        where: { eventId },
        _count: true,
      }),
    ])

    return {
      total,
      byRole: byRole.map(r => ({
        role: r.role || 'Participante',
        count: r._count,
      })),
    }
  }

  /**
   * Get overall certificate statistics
   */
  async getCertificateStats() {
    const [total, thisMonth, thisYear, byRole] = await Promise.all([
      prisma.certificate.count(),
      prisma.certificate.count({
        where: {
          issuedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.certificate.count({
        where: {
          issuedAt: {
            gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      }),
      prisma.certificate.groupBy({
        by: ['role'],
        _count: true,
      }),
    ])

    return {
      total,
      thisMonth,
      thisYear,
      byRole: byRole.map(r => ({
        role: r.role || 'Participante',
        count: r._count,
      })),
    }
  }
}

export const certificateService = new CertificateService()
