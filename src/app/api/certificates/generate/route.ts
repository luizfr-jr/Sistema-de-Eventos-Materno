import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { certificateService } from '@/services/certificate.service'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const generateCertificatesSchema = z.object({
  eventId: z.string().cuid(),
  role: z.string().optional().default('Participante'),
})

/**
 * POST /api/certificates/generate
 * Generate certificates for event participants
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

    // Check if user has permission to generate certificates
    const userRole = (session.user as any).role
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.COORDINATOR) {
      return NextResponse.json(
        { error: 'Sem permissão para gerar certificados' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = generateCertificatesSchema.parse(body)

    // Generate certificates for all confirmed participants
    const result = await certificateService.generateEventCertificates(
      validatedData.eventId,
      { role: validatedData.role }
    )

    if (result.generated === 0) {
      return NextResponse.json(
        {
          message: result.message,
          generated: 0,
          errors: result.errors,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        message: `${result.generated} certificado(s) gerado(s) com sucesso`,
        generated: result.generated,
        certificates: result.certificates,
        errors: result.errors,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error generating certificates:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors,
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
      { error: 'Erro ao gerar certificados' },
      { status: 500 }
    )
  }
}
