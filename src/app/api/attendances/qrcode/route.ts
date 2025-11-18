import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { attendanceService } from '@/services/attendance.service'
import { AttendanceMethod } from '@prisma/client'
import { ZodError, z } from 'zod'
import QRCode from 'qrcode'

const qrcodeGenerateSchema = z.object({
  registrationId: z.string().min(1, 'ID da inscrição é obrigatório'),
  eventId: z.string().min(1, 'ID do evento é obrigatório'),
})

const qrcodeCheckinSchema = z.object({
  qrData: z.string().min(1, 'Dados do QR Code são obrigatórios'),
})

/**
 * POST /api/attendances/qrcode
 * Generate QR code for check-in or process QR code check-in
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
    const action = body.action // 'generate' or 'checkin'

    if (action === 'generate') {
      // Generate QR code
      const validatedData = qrcodeGenerateSchema.parse(body)

      const qrData = attendanceService.generateQRCodeData(
        validatedData.registrationId,
        validatedData.eventId
      )

      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#8b7db8', // ninma purple
          light: '#ffffff',
        },
      })

      return NextResponse.json({
        success: true,
        qrCode: qrCodeDataURL,
        qrData,
      })
    } else if (action === 'checkin') {
      // Process QR code check-in
      const validatedData = qrcodeCheckinSchema.parse(body)

      // Validate QR code data
      const validation = attendanceService.validateQRCodeData(validatedData.qrData)

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      }

      // Get IP address and user agent
      const ipAddress = request.headers.get('x-forwarded-for') ||
                        request.headers.get('x-real-ip') ||
                        'unknown'
      const userAgent = request.headers.get('user-agent') || undefined

      // Perform check-in
      const attendance = await attendanceService.checkin({
        registrationId: validation.registrationId!,
        method: AttendanceMethod.QR_CODE,
        ipAddress,
        userAgent,
        recordedById: session.user.id,
      })

      return NextResponse.json({
        success: true,
        message: 'Check-in realizado com sucesso via QR Code',
        attendance,
      })
    } else {
      return NextResponse.json(
        { error: 'Ação inválida. Use "generate" ou "checkin"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error processing QR code:', error)

    if (error instanceof ZodError) {
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
      { error: 'Erro ao processar QR Code' },
      { status: 500 }
    )
  }
}
