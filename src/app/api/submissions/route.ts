import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { submissionService } from '@/services/submission.service'
import { submissionSchema } from '@/lib/validators'
import { SubmissionStatus, UserRole } from '@prisma/client'
import { ZodError } from 'zod'

/**
 * GET /api/submissions
 * List submissions with filters and pagination
 * - Users see their own submissions
 * - Reviewers see submissions they can review
 * - Coordinators and Admins see all submissions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const userRole = (session.user as any).role

    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const eventId = searchParams.get('eventId') || undefined
    const status = searchParams.get('status') as SubmissionStatus | null
    const search = searchParams.get('search') || undefined
    const orderBy = searchParams.get('orderBy') || 'submittedAt'
    const order = searchParams.get('order') || 'desc'

    // Build filters based on user role
    const filters: any = {
      ...(eventId && { eventId }),
      ...(status && { status }),
      ...(search && { search }),
    }

    // If user is a regular participant, only show their submissions
    if (userRole === UserRole.PARTICIPANT) {
      filters.userId = session.user.id
    }

    // Build orderBy
    const orderByObj: any = {}
    orderByObj[orderBy] = order

    // If user is a reviewer, get submissions they can review
    let result
    if (userRole === UserRole.REVIEWER) {
      result = await submissionService.getReviewerSubmissions(
        session.user.id!,
        page,
        limit
      )
    } else {
      result = await submissionService.listSubmissions(
        filters,
        page,
        limit,
        orderByObj
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar submissões' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/submissions
 * Create a new submission
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

    const body = await request.json()

    // Validate input (excluding file data which is handled separately)
    const validatedData = submissionSchema.parse(body)

    // Check if file data is provided
    if (!body.fileUrl || !body.fileName || !body.fileSize || !body.mimeType) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (body.fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 10MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowedTypes.includes(body.mimeType)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Permitidos: PDF, DOC, DOCX' },
        { status: 400 }
      )
    }

    const submissionData = {
      ...validatedData,
      eventId: body.eventId,
      userId: session.user.id!,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      status: body.status || SubmissionStatus.SUBMITTED,
    }

    const submission = await submissionService.createSubmission(submissionData)

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error creating submission:', error)

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
      { error: 'Erro ao criar submissão' },
      { status: 500 }
    )
  }
}
