import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { certificateService } from '@/services/certificate.service'
import { pdfService } from '@/services/pdf.service'
import { UserRole } from '@prisma/client'

/**
 * GET /api/certificates/[id]/download
 * Download certificate PDF
 * - Users can download their own certificates
 * - ADMIN/COORDINATOR can download all certificates
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

    // Check if user can download this certificate
    if (
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.COORDINATOR &&
      certificate.userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Sem permissão para baixar este certificado' },
        { status: 403 }
      )
    }

    // Generate PDF
    const pdfBlob = await pdfService.generateCertificatePDF({
      participantName: certificate.user.name,
      eventTitle: certificate.event.title,
      eventType: pdfService.getEventTypeLabel(certificate.event.type),
      startDate: certificate.event.startDate,
      endDate: certificate.event.endDate,
      workload: certificate.workload,
      role: certificate.role || 'Participante',
      verificationCode: certificate.verificationCode,
      issuedAt: certificate.issuedAt,
      institution: certificate.user.institution || undefined,
      location: certificate.event.location,
      coordinatorName: certificate.event.createdBy?.name,
      coordinatorInstitution: certificate.event.createdBy?.institution || undefined,
    })

    // Convert Blob to Buffer for Node.js
    const buffer = Buffer.from(await pdfBlob.arrayBuffer())

    // Create filename
    const filename = `certificado-${certificate.verificationCode}.pdf`

    // Return PDF as download
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error downloading certificate:', error)
    return NextResponse.json(
      { error: 'Erro ao baixar certificado' },
      { status: 500 }
    )
  }
}
