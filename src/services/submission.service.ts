import { prisma } from '@/lib/prisma'
import { SubmissionStatus, ReviewStatus, UserRole, Prisma } from '@prisma/client'

export interface CreateSubmissionData {
  eventId: string
  userId: string
  title: string
  abstract: string
  keywords: string[]
  authors: Array<{
    name: string
    email: string
    institution?: string
  }>
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  status?: SubmissionStatus
}

export interface UpdateSubmissionData extends Partial<CreateSubmissionData> {}

export interface SubmissionFilters {
  eventId?: string
  userId?: string
  status?: SubmissionStatus
  search?: string
}

export interface CreateReviewData {
  submissionId: string
  reviewerId: string
  status: ReviewStatus
  rating?: number
  originality?: number
  relevance?: number
  methodology?: number
  clarity?: number
  comments: string
}

export class SubmissionService {
  /**
   * Create a new submission
   */
  async createSubmission(data: CreateSubmissionData) {
    // Check if event allows submissions
    const event = await prisma.event.findUnique({
      where: { id: data.eventId },
      select: {
        allowSubmissions: true,
        submissionStart: true,
        submissionEnd: true,
      },
    })

    if (!event) {
      throw new Error('Evento não encontrado')
    }

    if (!event.allowSubmissions) {
      throw new Error('Este evento não aceita submissões de trabalhos')
    }

    // Check submission period
    const now = new Date()
    if (event.submissionStart && now < event.submissionStart) {
      throw new Error('O período de submissão ainda não começou')
    }

    if (event.submissionEnd && now > event.submissionEnd) {
      throw new Error('O período de submissão já encerrou')
    }

    // Check for duplicate submission
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        eventId: data.eventId,
        userId: data.userId,
        status: { not: SubmissionStatus.DRAFT },
      },
    })

    if (existingSubmission) {
      throw new Error('Você já possui uma submissão para este evento')
    }

    return prisma.submission.create({
      data: {
        ...data,
        status: data.status || SubmissionStatus.SUBMITTED,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            institution: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })
  }

  /**
   * Update a submission
   */
  async updateSubmission(id: string, data: UpdateSubmissionData) {
    // Check if submission exists and is editable
    const submission = await prisma.submission.findUnique({
      where: { id },
      select: { status: true },
    })

    if (!submission) {
      throw new Error('Submissão não encontrada')
    }

    // Only DRAFT and REVISION submissions can be edited
    if (
      submission.status !== SubmissionStatus.DRAFT &&
      submission.status !== SubmissionStatus.REVISION
    ) {
      throw new Error('Esta submissão não pode mais ser editada')
    }

    return prisma.submission.update({
      where: { id },
      data,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            institution: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            reviewedAt: 'desc',
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })
  }

  /**
   * Delete a submission
   */
  async deleteSubmission(id: string) {
    const submission = await prisma.submission.findUnique({
      where: { id },
      select: { status: true },
    })

    if (!submission) {
      throw new Error('Submissão não encontrada')
    }

    // Only DRAFT submissions can be deleted
    if (submission.status !== SubmissionStatus.DRAFT) {
      throw new Error('Apenas rascunhos podem ser excluídos')
    }

    return prisma.submission.delete({
      where: { id },
    })
  }

  /**
   * Get submission by ID
   */
  async getSubmissionById(id: string) {
    return prisma.submission.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            submissionGuidelines: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            institution: true,
            image: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            reviewedAt: 'desc',
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })
  }

  /**
   * List submissions with filters and pagination
   */
  async listSubmissions(
    filters: SubmissionFilters = {},
    page = 1,
    limit = 10,
    orderBy: Prisma.SubmissionOrderByWithRelationInput = { submittedAt: 'desc' }
  ) {
    const where: Prisma.SubmissionWhereInput = {}

    if (filters.eventId) {
      where.eventId = filters.eventId
    }

    if (filters.userId) {
      where.userId = filters.userId
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { abstract: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              institution: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.submission.count({ where }),
    ])

    return {
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get submissions for a reviewer (assigned to review)
   */
  async getReviewerSubmissions(reviewerId: string, page = 1, limit = 10) {
    // Get submissions that the reviewer has already reviewed
    const reviewedSubmissionIds = await prisma.review.findMany({
      where: { reviewerId },
      select: { submissionId: true },
    })

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where: {
          OR: [
            // Submissions already reviewed
            { id: { in: reviewedSubmissionIds.map((r) => r.submissionId) } },
            // Submissions under review (available to review)
            { status: SubmissionStatus.UNDER_REVIEW },
          ],
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              institution: true,
            },
          },
          reviews: {
            where: { reviewerId },
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.submission.count({
        where: {
          OR: [
            { id: { in: reviewedSubmissionIds.map((r) => r.submissionId) } },
            { status: SubmissionStatus.UNDER_REVIEW },
          ],
        },
      }),
    ])

    return {
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Create a review for a submission
   */
  async createReview(data: CreateReviewData) {
    // Check if submission exists
    const submission = await prisma.submission.findUnique({
      where: { id: data.submissionId },
      select: {
        id: true,
        status: true,
        userId: true,
      },
    })

    if (!submission) {
      throw new Error('Submissão não encontrada')
    }

    // Check if submission is under review
    if (submission.status !== SubmissionStatus.UNDER_REVIEW) {
      throw new Error('Esta submissão não está disponível para avaliação')
    }

    // Check if reviewer already reviewed this submission
    const existingReview = await prisma.review.findFirst({
      where: {
        submissionId: data.submissionId,
        reviewerId: data.reviewerId,
      },
    })

    if (existingReview) {
      throw new Error('Você já avaliou esta submissão')
    }

    // Check if reviewer is the author
    if (submission.userId === data.reviewerId) {
      throw new Error('Você não pode avaliar seu próprio trabalho')
    }

    // Create review
    const review = await prisma.review.create({
      data,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Update submission status based on review
    let newStatus: SubmissionStatus = submission.status
    if (data.status === ReviewStatus.APPROVED) {
      // Check if all reviews are approved
      const allReviews = await prisma.review.findMany({
        where: { submissionId: data.submissionId },
      })

      const allApproved = allReviews.every((r) => r.status === ReviewStatus.APPROVED)
      if (allApproved && allReviews.length >= 1) {
        newStatus = SubmissionStatus.APPROVED
      }
    } else if (data.status === ReviewStatus.REJECTED) {
      newStatus = SubmissionStatus.REJECTED
    } else if (data.status === ReviewStatus.REVISION) {
      newStatus = SubmissionStatus.REVISION
    }

    // Update submission status
    await prisma.submission.update({
      where: { id: data.submissionId },
      data: { status: newStatus },
    })

    return review
  }

  /**
   * Check if user can manage submission (author, admin, or coordinator)
   */
  async canUserManageSubmission(userId: string, submissionId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user) return false
    if (user.role === UserRole.ADMIN || user.role === UserRole.COORDINATOR) return true

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { userId: true },
    })

    if (!submission) return false

    return submission.userId === userId
  }

  /**
   * Check if user can review submission
   */
  async canUserReviewSubmission(userId: string, submissionId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user) return false

    // Only REVIEWER, COORDINATOR, and ADMIN can review
    if (
      user.role !== UserRole.REVIEWER &&
      user.role !== UserRole.COORDINATOR &&
      user.role !== UserRole.ADMIN
    ) {
      return false
    }

    // Check if user is the author
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { userId: true },
    })

    if (!submission) return false
    if (submission.userId === userId) return false

    return true
  }

  /**
   * Get submission statistics for an event
   */
  async getEventSubmissionStats(eventId: string) {
    const [
      total,
      draft,
      submitted,
      underReview,
      approved,
      rejected,
      revision,
    ] = await Promise.all([
      prisma.submission.count({ where: { eventId } }),
      prisma.submission.count({ where: { eventId, status: SubmissionStatus.DRAFT } }),
      prisma.submission.count({ where: { eventId, status: SubmissionStatus.SUBMITTED } }),
      prisma.submission.count({ where: { eventId, status: SubmissionStatus.UNDER_REVIEW } }),
      prisma.submission.count({ where: { eventId, status: SubmissionStatus.APPROVED } }),
      prisma.submission.count({ where: { eventId, status: SubmissionStatus.REJECTED } }),
      prisma.submission.count({ where: { eventId, status: SubmissionStatus.REVISION } }),
    ])

    return {
      total,
      byStatus: {
        draft,
        submitted,
        underReview,
        approved,
        rejected,
        revision,
      },
    }
  }

  /**
   * Get user submission statistics
   */
  async getUserSubmissionStats(userId: string) {
    const [total, approved, rejected, underReview] = await Promise.all([
      prisma.submission.count({ where: { userId } }),
      prisma.submission.count({ where: { userId, status: SubmissionStatus.APPROVED } }),
      prisma.submission.count({ where: { userId, status: SubmissionStatus.REJECTED } }),
      prisma.submission.count({ where: { userId, status: SubmissionStatus.UNDER_REVIEW } }),
    ])

    return {
      total,
      approved,
      rejected,
      underReview,
    }
  }
}

export const submissionService = new SubmissionService()
