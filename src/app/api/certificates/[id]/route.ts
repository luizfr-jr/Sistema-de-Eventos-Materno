import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { certificateService } from '@/services/certificate.service'
import { UserRole } from '@prisma/client'

/**
 * GET /api/certificates/[id]
 * Get certificate details
 * - Users can view their own certificates
 * - ADMIN/COORDINATOR can view all certificates
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

    const certificate = await certificateService.getCertificateById(params.id)

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificado não encontrado' },
        { status: 404 }
      )
    }

    const userRole = (session.user as any).role

    // Check if user can access this certificate
    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.COORDINATOR &&
      certificate.userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para acessar este certificado' },
        { status: 403 }
      )
    }

    return NextResponse.json(certificate)
  } catch (error) {
    console.error('Error fetching certificate:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar certificado' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/certificates/[id]
 * Delete certificate
 * Requires ADMIN or COORDINATOR role
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

    // Check if user has permission to delete certificates
    const userRole = (session.user as any).role
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.COORDINATOR) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar certificados' },
        { status: 403 }
      )
    }

    await certificateService.deleteCertificate(params.id)

    return NextResponse.json(
      { message: 'Certificado deletado com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting certificate:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar certificado' },
      { status: 500 }
    )
  }
}
