'use client'

import { formatDate } from '@/lib/utils'

interface CertificateTemplateProps {
  participantName: string
  eventTitle: string
  eventType: string
  startDate: string | Date
  endDate: string | Date
  workload: number
  role: string
  verificationCode: string
  issuedAt: string | Date
  institution?: string
  location?: string
}

/**
 * CertificateTemplate - Visual representation of the certificate
 * This is used for preview purposes. The actual PDF is generated server-side.
 */
export function CertificateTemplate({
  participantName,
  eventTitle,
  eventType,
  startDate,
  endDate,
  workload,
  role,
  verificationCode,
  issuedAt,
  institution,
  location,
}: CertificateTemplateProps) {
  const getRoleText = (role: string) => {
    const roleTexts: Record<string, string> = {
      Participante: 'participou do',
      Palestrante: 'atuou como palestrante no',
      Coordenador: 'atuou como coordenador do',
      Organizador: 'atuou como organizador do',
      Avaliador: 'atuou como avaliador no',
      Autor: 'apresentou trabalho no',
    }
    return roleTexts[role] || 'participou do'
  }

  return (
    <div className="w-full aspect-[297/210] bg-white p-8 relative border-4 border-ninma-purple rounded-lg shadow-xl overflow-hidden">
      {/* Decorative border */}
      <div className="absolute inset-2 border-2 border-ninma-orange rounded-lg pointer-events-none" />

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-ninma-purple rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-ninma-purple rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-ninma-purple rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-ninma-purple rounded-br-lg" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-between py-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-ninma-purple">
            ninma hub
          </h1>
          <p className="text-xs md:text-sm text-gray-600">
            Sistema de Gestão de Eventos Acadêmicos
          </p>
          <div className="h-px w-32 mx-auto bg-ninma-orange mt-2" />
        </div>

        {/* Certificate Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-ninma-purple tracking-wide">
            CERTIFICADO
          </h2>
          <div className="h-1 w-48 mx-auto bg-ninma-purple rounded-full" />
        </div>

        {/* Main Content */}
        <div className="text-center space-y-3 max-w-2xl px-4">
          <p className="text-sm md:text-base text-gray-700">
            Certificamos que
          </p>

          <p className="text-xl md:text-2xl font-bold text-ninma-purple">
            {participantName}
          </p>

          {institution && (
            <p className="text-xs md:text-sm text-gray-600 italic">
              {institution}
            </p>
          )}

          <p className="text-sm md:text-base text-gray-700">
            {getRoleText(role)}
          </p>

          <p className="text-base md:text-lg font-semibold text-ninma-orange">
            {eventTitle}
          </p>

          <p className="text-xs md:text-sm text-gray-700">
            realizado no período de {formatDate(startDate)} a {formatDate(endDate)}
          </p>

          {location && (
            <p className="text-xs md:text-sm text-gray-700">
              em {location}
            </p>
          )}

          <p className="text-xs md:text-sm text-gray-700">
            com carga horária de <span className="font-semibold">{workload} horas</span>
          </p>
        </div>

        {/* Footer */}
        <div className="w-full flex justify-between items-end px-4 text-xs text-gray-500">
          <div className="space-y-1">
            <div className="w-24 h-24 border-2 border-ninma-purple rounded flex items-center justify-center">
              <span className="text-xs text-center px-2">QR Code</span>
            </div>
            <p className="text-xs">
              <span className="font-semibold">Código:</span>
              <br />
              {verificationCode}
            </p>
          </div>

          <div className="text-right space-y-2">
            <div className="border-t-2 border-gray-400 w-48 pt-1">
              <p className="font-semibold">Coordenação do Evento</p>
            </div>
            <p>Emitido em {formatDate(issuedAt)}</p>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400 text-center">
        Verifique a autenticidade em ninmahub.com.br/certificates/verify
      </div>
    </div>
  )
}
