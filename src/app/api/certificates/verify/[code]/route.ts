import { NextRequest, NextResponse } from 'next/server'
import { certificateService } from '@/services/certificate.service'

/**
 * GET /api/certificates/verify/[code]
 * Verify certificate by verification code
 * Public route - no authentication required
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const result = await certificateService.verifyCertificate(params.code)

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          reason: result.reason,
        },
        { status: result.certificate ? 200 : 404 }
      )
    }

    return NextResponse.json({
      valid: true,
      certificate: result.certificate,
    })
  } catch (error) {
    console.error('Error verifying certificate:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar certificado' },
      { status: 500 }
    )
  }
}
