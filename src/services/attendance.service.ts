import { prisma } from '@/lib/prisma'
import { AttendanceMethod, RegistrationStatus, UserRole } from '@prisma/client'

export interface CheckinData {
  registrationId: string
  method: AttendanceMethod
  location?: string
  ipAddress?: string
  userAgent?: string
  notes?: string
  recordedById?: string
}

export interface CheckoutData {
  registrationId: string
  notes?: string
}

export interface AttendanceFilters {
  eventId?: string
  method?: AttendanceMethod
  search?: string
  startDate?: Date
  endDate?: Date
}

export interface AttendanceStats {
  total: number
  present: number
  absent: number
  percentage: number
  byMethod: {
    QR_CODE: number
    MANUAL: number
    AUTOMATIC: number
  }
}

export class AttendanceService {
  /**
   * Register check-in for a registration
   */
  async checkin(data: CheckinData) {
    // Validate registration exists and is confirmed
    const registration = await prisma.registration.findUnique({
      where: { id: data.registrationId },
      include: {
        event: true,
        user: true,
        attendance: true,
      },
    })

    if (!registration) {
      throw new Error('Inscrição não encontrada')
    }

    if (registration.status !== RegistrationStatus.CONFIRMED) {
      throw new Error('Apenas inscrições confirmadas podem fazer check-in')
    }

    if (registration.attendance) {
      throw new Error('Check-in já realizado para esta inscrição')
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        registrationId: data.registrationId,
        checkinAt: new Date(),
        method: data.method,
        location: data.location,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        notes: data.notes,
        recordedById: data.recordedById,
      },
      include: {
        registration: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    })

    // Update registration status to ATTENDED
    await prisma.registration.update({
      where: { id: data.registrationId },
      data: { status: RegistrationStatus.ATTENDED },
    })

    return attendance
  }

  /**
   * Register check-out for a registration
   */
  async checkout(data: CheckoutData) {
    // Find attendance record
    const attendance = await prisma.attendance.findUnique({
      where: { registrationId: data.registrationId },
      include: {
        registration: {
          include: {
            user: true,
            event: true,
          },
        },
      },
    })

    if (!attendance) {
      throw new Error('Check-in não encontrado')
    }

    if (attendance.checkoutAt) {
      throw new Error('Check-out já realizado')
    }

    // Update attendance with checkout time
    return prisma.attendance.update({
      where: { registrationId: data.registrationId },
      data: {
        checkoutAt: new Date(),
        notes: data.notes || attendance.notes,
      },
      include: {
        registration: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * Get attendance by registration ID
   */
  async getAttendanceByRegistrationId(registrationId: string) {
    return prisma.attendance.findUnique({
      where: { registrationId },
      include: {
        registration: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                institution: true,
              },
            },
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * List attendances for an event
   */
  async listEventAttendances(eventId: string, filters: AttendanceFilters = {}) {
    const where: any = {
      registration: {
        eventId,
      },
    }

    if (filters.method) {
      where.method = filters.method
    }

    if (filters.search) {
      where.registration = {
        ...where.registration,
        user: {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
          ],
        },
      }
    }

    if (filters.startDate) {
      where.checkinAt = { gte: filters.startDate }
    }

    if (filters.endDate) {
      where.checkinAt = {
        ...where.checkinAt,
        lte: filters.endDate,
      }
    }

    return prisma.attendance.findMany({
      where,
      include: {
        registration: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                institution: true,
                course: true,
              },
            },
          },
        },
      },
      orderBy: {
        checkinAt: 'desc',
      },
    })
  }

  /**
   * Get attendance statistics for an event
   */
  async getEventAttendanceStats(eventId: string): Promise<AttendanceStats> {
    const [totalRegistrations, attendances] = await Promise.all([
      prisma.registration.count({
        where: {
          eventId,
          status: RegistrationStatus.CONFIRMED,
        },
      }),
      prisma.attendance.findMany({
        where: {
          registration: {
            eventId,
          },
        },
        select: {
          method: true,
        },
      }),
    ])

    const present = attendances.length
    const absent = totalRegistrations - present
    const percentage = totalRegistrations > 0
      ? Math.round((present / totalRegistrations) * 100)
      : 0

    const byMethod = {
      QR_CODE: attendances.filter((a) => a.method === AttendanceMethod.QR_CODE).length,
      MANUAL: attendances.filter((a) => a.method === AttendanceMethod.MANUAL).length,
      AUTOMATIC: attendances.filter((a) => a.method === AttendanceMethod.AUTOMATIC).length,
    }

    return {
      total: totalRegistrations,
      present,
      absent,
      percentage,
      byMethod,
    }
  }

  /**
   * Get all registrations with attendance status for an event
   */
  async getEventRegistrationsWithAttendance(eventId: string, search?: string) {
    const where: any = {
      eventId,
      status: RegistrationStatus.CONFIRMED,
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    return prisma.registration.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            institution: true,
            course: true,
          },
        },
        attendance: true,
      },
      orderBy: {
        registeredAt: 'asc',
      },
    })
  }

  /**
   * Bulk check-in for multiple registrations
   */
  async bulkCheckin(
    registrationIds: string[],
    method: AttendanceMethod,
    recordedById?: string
  ) {
    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    }

    for (const registrationId of registrationIds) {
      try {
        await this.checkin({
          registrationId,
          method,
          recordedById,
        })
        results.success.push(registrationId)
      } catch (error) {
        results.failed.push({
          id: registrationId,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        })
      }
    }

    return results
  }

  /**
   * Check if user can manage attendances for an event
   */
  async canUserManageAttendances(userId: string, eventId: string): Promise<boolean> {
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
   * Generate QR code data for registration check-in
   */
  generateQRCodeData(registrationId: string, eventId: string): string {
    // Create a JSON object with registration and event IDs
    const data = {
      type: 'ATTENDANCE_CHECKIN',
      registrationId,
      eventId,
      timestamp: Date.now(),
    }

    // Return as JSON string (will be used to generate QR code)
    return JSON.stringify(data)
  }

  /**
   * Validate QR code data
   */
  validateQRCodeData(qrData: string): { valid: boolean; registrationId?: string; eventId?: string; error?: string } {
    try {
      const data = JSON.parse(qrData)

      if (data.type !== 'ATTENDANCE_CHECKIN') {
        return { valid: false, error: 'QR Code inválido' }
      }

      if (!data.registrationId || !data.eventId) {
        return { valid: false, error: 'Dados incompletos no QR Code' }
      }

      // Check if QR code is not too old (24 hours)
      const ageInHours = (Date.now() - data.timestamp) / (1000 * 60 * 60)
      if (ageInHours > 24) {
        return { valid: false, error: 'QR Code expirado' }
      }

      return {
        valid: true,
        registrationId: data.registrationId,
        eventId: data.eventId,
      }
    } catch (error) {
      return { valid: false, error: 'QR Code inválido' }
    }
  }

  /**
   * Export attendance list to CSV format
   */
  async exportAttendanceToCSV(eventId: string): Promise<string> {
    const registrations = await this.getEventRegistrationsWithAttendance(eventId)

    const headers = [
      'Nome',
      'Email',
      'Instituição',
      'Curso',
      'Status',
      'Check-in',
      'Check-out',
      'Método',
      'Localização',
    ]

    const rows = registrations.map((reg) => [
      reg.user.name,
      reg.user.email,
      reg.user.institution || '-',
      reg.user.course || '-',
      reg.attendance ? 'Presente' : 'Ausente',
      reg.attendance ? new Date(reg.attendance.checkinAt).toLocaleString('pt-BR') : '-',
      reg.attendance?.checkoutAt
        ? new Date(reg.attendance.checkoutAt).toLocaleString('pt-BR')
        : '-',
      reg.attendance?.method || '-',
      reg.attendance?.location || '-',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    return csvContent
  }

  /**
   * Delete attendance (undo check-in)
   */
  async deleteAttendance(registrationId: string) {
    const attendance = await prisma.attendance.findUnique({
      where: { registrationId },
      include: {
        registration: true,
      },
    })

    if (!attendance) {
      throw new Error('Presença não encontrada')
    }

    // Delete attendance and update registration status back to CONFIRMED
    await prisma.$transaction([
      prisma.attendance.delete({
        where: { registrationId },
      }),
      prisma.registration.update({
        where: { id: registrationId },
        data: { status: RegistrationStatus.CONFIRMED },
      }),
    ])

    return { success: true }
  }
}

export const attendanceService = new AttendanceService()
