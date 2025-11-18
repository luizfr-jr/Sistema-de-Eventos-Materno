'use client'

import { CertificateTemplate } from './CertificateTemplate'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface CertificatePreviewProps {
  certificate: {
    verificationCode: string
    workload: number
    role: string
    issuedAt: string
    event: {
      title: string
      startDate: string
      endDate: string
      location: string
      type: string
    }
    user: {
      name: string
      institution: string | null
    }
  }
}

/**
 * CertificatePreview - Shows a preview of the certificate
 */
export function CertificatePreview({ certificate }: CertificatePreviewProps) {
  const EVENT_TYPE_LABELS: Record<string, string> = {
    CONFERENCE: 'Conferência',
    WORKSHOP: 'Workshop',
    SEMINAR: 'Seminário',
    COURSE: 'Curso',
    WEBINAR: 'Webinar',
    SYMPOSIUM: 'Simpósio',
    CONGRESS: 'Congresso',
    OTHER: 'Evento',
  }

  return (
    <Card variant="bordered">
      <CardHeader divider>
        <CardTitle as="h2" className="text-xl">
          Pré-visualização
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <CertificateTemplate
            participantName={certificate.user.name}
            eventTitle={certificate.event.title}
            eventType={EVENT_TYPE_LABELS[certificate.event.type] || 'Evento'}
            startDate={certificate.event.startDate}
            endDate={certificate.event.endDate}
            workload={certificate.workload}
            role={certificate.role}
            verificationCode={certificate.verificationCode}
            issuedAt={certificate.issuedAt}
            institution={certificate.user.institution || undefined}
            location={certificate.event.location}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Esta é uma pré-visualização. O certificado PDF terá formatação profissional completa.
        </p>
      </CardContent>
    </Card>
  )
}
