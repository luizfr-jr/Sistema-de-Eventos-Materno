import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { submissionService } from '@/services/submission.service'
import { submissionSchema } from '@/lib/validators'
import { UserRole } from '@prisma/client'
import { ZodError } from 'zod'

/**
 * GET /api/submissions/[id]
 * Get a specific submission by ID
 */
export async function GET(
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

    const submission = await submissionService.getSubmissionById(params.id)

    if (!submission) {
      return NextResponse.json(
        { error: 'Submissão não encontrada' },
        { status: 404 }
      )
    }

    const userRole = (session.user as any).role

    // Check permissions
    const canView =
      userRole === UserRole.ADMIN ||
      userRole === UserRole.COORDINATOR ||
      userRole === UserRole.REVIEWER ||
      submission.userId === session.user.id

    if (!canView) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar esta submissão' },
        { status: 403 }
      )
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error fetching submission:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar submissão' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/submissions/[id]
 * Update a submission
 */
export async function PATCH(
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

    // Check if user can manage this submission
    const canManage = await submissionService.canUserManageSubmission(
      session.user.id!,
      params.id
    )

    if (!canManage) {
      return NextResponse.json(
        { error: 'Sem permissão para editar esta submissão' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input (partial update)
    const validatedData = submissionSchema.partial().parse(body)

    // If file is being updated, validate it
    if (body.fileUrl) {
      if (!body.fileName || !body.fileSize || !body.mimeType) {
        return NextResponse.json(
          { error: 'Dados do arquivo incompletos' },
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
    }

    const updateData = {
      ...validatedData,
      ...(body.fileUrl && {
        fileUrl: body.fileUrl,
        fileName: body.fileName,
        fileSize: body.fileSize,
        mimeType: body.mimeType,
      }),
      ...(body.status && { status: body.status }),
    }

    const submission = await submissionService.updateSubmission(
      params.id,
      updateData
    )

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error updating submission:', error)

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
      { error: 'Erro ao atualizar submissão' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/submissions/[id]
 * Delete a submission (only DRAFT submissions)
 */
export async function DELETE(
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

    // Check if user can manage this submission
    const canManage = await submissionService.canUserManageSubmission(
      session.user.id!,
      params.id
    )

    if (!canManage) {
      return NextResponse.json(
        { error: 'Sem permissão para excluir esta submissão' },
        { status: 403 }
      )
    }

    await submissionService.deleteSubmission(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting submission:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao excluir submissão' },
      { status: 500 }
    )
  }
}
