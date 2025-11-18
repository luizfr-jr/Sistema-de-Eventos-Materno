import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import { formatDate } from '@/lib/utils'

interface CertificateData {
  participantName: string
  eventTitle: string
  eventType: string
  startDate: Date | string
  endDate: Date | string
  workload: number
  role: string
  verificationCode: string
  issuedAt: Date | string
  institution?: string
  location?: string
  coordinatorName?: string
  coordinatorInstitution?: string
}

export class PDFService {
  /**
   * Generate certificate PDF
   */
  async generateCertificatePDF(data: CertificateData): Promise<Blob> {
    // Create PDF in landscape A4 (297 x 210 mm)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Load custom font (using default for now)
    // In production, you would load custom fonts here

    // Draw border frame
    this.drawBorder(pdf, pageWidth, pageHeight)

    // Draw ninma logo area (header)
    this.drawHeader(pdf, pageWidth)

    // Certificate title
    pdf.setFontSize(32)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(124, 58, 237) // ninma purple
    const title = 'CERTIFICADO'
    const titleWidth = pdf.getTextWidth(title)
    pdf.text(title, (pageWidth - titleWidth) / 2, 55)

    // Underline
    pdf.setLineWidth(0.5)
    pdf.setDrawColor(124, 58, 237)
    pdf.line((pageWidth - titleWidth) / 2, 57, (pageWidth + titleWidth) / 2, 57)

    // Main text
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(60, 60, 60)

    const mainText = 'Certificamos que'
    const mainTextWidth = pdf.getTextWidth(mainText)
    pdf.text(mainText, (pageWidth - mainTextWidth) / 2, 70)

    // Participant name
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(124, 58, 237)
    const nameWidth = pdf.getTextWidth(data.participantName)
    pdf.text(data.participantName, (pageWidth - nameWidth) / 2, 82)

    // Institution (if available)
    if (data.institution) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'italic')
      pdf.setTextColor(80, 80, 80)
      const instText = data.institution
      const instWidth = pdf.getTextWidth(instText)
      pdf.text(instText, (pageWidth - instWidth) / 2, 90)
    }

    // Event description
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(60, 60, 60)

    const roleText = this.getRoleText(data.role)
    const roleTextWidth = pdf.getTextWidth(roleText)
    pdf.text(roleText, (pageWidth - roleTextWidth) / 2, data.institution ? 100 : 95)

    // Event title
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(251, 146, 60) // ninma orange

    // Handle long event titles with word wrap
    const eventTitleLines = pdf.splitTextToSize(data.eventTitle, pageWidth - 80)
    const eventTitleY = data.institution ? 110 : 105
    pdf.text(eventTitleLines, pageWidth / 2, eventTitleY, { align: 'center' })

    // Event details
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(60, 60, 60)

    const detailsY = eventTitleY + (eventTitleLines.length * 6) + 5

    const dateText = `realizado no período de ${formatDate(data.startDate)} a ${formatDate(data.endDate)}`
    const dateWidth = pdf.getTextWidth(dateText)
    pdf.text(dateText, (pageWidth - dateWidth) / 2, detailsY)

    if (data.location) {
      const locationText = `em ${data.location}`
      const locationWidth = pdf.getTextWidth(locationText)
      pdf.text(locationText, (pageWidth - locationWidth) / 2, detailsY + 6)
    }

    const workloadText = `com carga horária de ${data.workload} horas`
    const workloadWidth = pdf.getTextWidth(workloadText)
    pdf.text(workloadText, (pageWidth - workloadWidth) / 2, detailsY + (data.location ? 12 : 6))

    // Generate QR Code
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/certificates/verify/${data.verificationCode}`
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 400,
      margin: 1,
      color: {
        dark: '#7C3AED',
        light: '#FFFFFF',
      },
    })

    // Add QR Code to PDF
    const qrSize = 25
    pdf.addImage(qrCodeDataUrl, 'PNG', 20, pageHeight - 40, qrSize, qrSize)

    // Verification code
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)
    pdf.text('Código de Verificação:', 20, pageHeight - 12)
    pdf.setFont('helvetica', 'bold')
    pdf.text(data.verificationCode, 20, pageHeight - 8)

    // Issue date (right side)
    pdf.setFont('helvetica', 'normal')
    const issueDateText = `Emitido em ${formatDate(data.issuedAt)}`
    const issueDateWidth = pdf.getTextWidth(issueDateText)
    pdf.text(issueDateText, pageWidth - issueDateWidth - 20, pageHeight - 12)

    // Signature line
    const signatureY = pageHeight - 35
    pdf.setLineWidth(0.3)
    pdf.setDrawColor(100, 100, 100)
    pdf.line(pageWidth - 100, signatureY, pageWidth - 20, signatureY)

    // Coordinator signature
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    const coordName = data.coordinatorName || 'Coordenação do Evento'
    const coordNameWidth = pdf.getTextWidth(coordName)
    pdf.text(coordName, pageWidth - 60 - (coordNameWidth / 2), signatureY + 5)

    if (data.coordinatorInstitution) {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      const coordInst = data.coordinatorInstitution
      const coordInstWidth = pdf.getTextWidth(coordInst)
      pdf.text(coordInst, pageWidth - 60 - (coordInstWidth / 2), signatureY + 10)
    }

    // Footer with ninma branding
    this.drawFooter(pdf, pageWidth, pageHeight)

    // Convert to Blob
    return pdf.output('blob')
  }

  /**
   * Draw decorative border
   */
  private drawBorder(pdf: jsPDF, width: number, height: number) {
    // Outer border
    pdf.setLineWidth(1)
    pdf.setDrawColor(124, 58, 237) // ninma purple
    pdf.rect(10, 10, width - 20, height - 20)

    // Inner border
    pdf.setLineWidth(0.3)
    pdf.setDrawColor(251, 146, 60) // ninma orange
    pdf.rect(12, 12, width - 24, height - 24)

    // Corner decorations
    const cornerSize = 15

    // Top-left
    pdf.setFillColor(124, 58, 237, 0.1)
    pdf.triangle(10, 10, 10, 10 + cornerSize, 10 + cornerSize, 10, 'F')

    // Top-right
    pdf.triangle(width - 10, 10, width - 10, 10 + cornerSize, width - 10 - cornerSize, 10, 'F')

    // Bottom-left
    pdf.triangle(10, height - 10, 10, height - 10 - cornerSize, 10 + cornerSize, height - 10, 'F')

    // Bottom-right
    pdf.triangle(
      width - 10,
      height - 10,
      width - 10,
      height - 10 - cornerSize,
      width - 10 - cornerSize,
      height - 10,
      'F'
    )
  }

  /**
   * Draw header
   */
  private drawHeader(pdf: jsPDF, width: number) {
    // ninma hub branding
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(124, 58, 237)
    const brandText = 'ninma hub'
    const brandWidth = pdf.getTextWidth(brandText)
    pdf.text(brandText, (width - brandWidth) / 2, 25)

    // Subtitle
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)
    const subtitle = 'Sistema de Gestão de Eventos Acadêmicos'
    const subtitleWidth = pdf.getTextWidth(subtitle)
    pdf.text(subtitle, (width - subtitleWidth) / 2, 32)

    // Decorative line
    pdf.setLineWidth(0.3)
    pdf.setDrawColor(251, 146, 60)
    pdf.line(width / 2 - 80, 35, width / 2 + 80, 35)
  }

  /**
   * Draw footer
   */
  private drawFooter(pdf: jsPDF, width: number, height: number) {
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'italic')
    pdf.setTextColor(120, 120, 120)
    const footerText = 'Este certificado pode ser verificado em ' +
      (process.env.NEXT_PUBLIC_APP_URL || 'ninmahub.com.br') +
      '/certificates/verify'
    const footerWidth = pdf.getTextWidth(footerText)
    pdf.text(footerText, (width - footerWidth) / 2, height - 4)
  }

  /**
   * Get role text in Portuguese
   */
  private getRoleText(role: string): string {
    const roleTexts: Record<string, string> = {
      'Participante': 'participou do',
      'Palestrante': 'atuou como palestrante no',
      'Coordenador': 'atuou como coordenador do',
      'Organizador': 'atuou como organizador do',
      'Avaliador': 'atuou como avaliador no',
      'Autor': 'apresentou trabalho no',
    }

    return roleTexts[role] || 'participou do'
  }

  /**
   * Download PDF
   */
  downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Get event type label in Portuguese
   */
  getEventTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      CONFERENCE: 'Conferência',
      WORKSHOP: 'Workshop',
      SEMINAR: 'Seminário',
      COURSE: 'Curso',
      WEBINAR: 'Webinar',
      SYMPOSIUM: 'Simpósio',
      CONGRESS: 'Congresso',
      OTHER: 'Evento',
    }

    return labels[type] || 'Evento'
  }
}

export const pdfService = new PDFService()
