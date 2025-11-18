import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { submissionService } from '@/services/submission.service'
import { reviewSchema } from '@/lib/validators'
import { UserRole } from '@prisma/client'
import { ZodError } from 'zod'

/**
 * POST /api/submissions/[id]/review
 * Submit a review for a submission
 * Requires REVIEWER, COORDINATOR, or ADMIN role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userRole = (session.user as any).role

    // Check if user has permission to review
    if (
      userRole !== UserRole.REVIEWER &&
      userRole !== UserRole.COORDINATOR &&
      userRole !== UserRole.ADMIN
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para avaliar trabalhos' },
        { status: 403 }
      )
    }

    // Check if user can review this specific submission
    const canReview = await submissionService.canUserReviewSubmission(
      session.user.id!,
      params.id
    )

    if (!canReview) {
      return NextResponse.json(
        { error: 'Você não pode avaliar esta submissão' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = reviewSchema.parse(body)

    const reviewData = {
      submissionId: params.id,
      reviewerId: session.user.id!,
      ...validatedData,
    }

    const review = await submissionService.createReview(reviewData)

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors
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
      { error: 'Erro ao criar avaliação' },
      { status: 500 }
    )
  }
}
