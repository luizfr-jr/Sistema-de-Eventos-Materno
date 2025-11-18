'use client'

import Link from 'next/link'
import { Award, Calendar, Clock, Download, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

interface CertificateCardProps {
  certificate: {
    id: string
    verificationCode: string
    workload: number
    role: string
    issuedAt: string
    validUntil: string | null
    event: {
      id: string
      title: string
      startDate: string
      endDate: string
      type: string
    }
    user: {
      id: string
      name: string
      email: string
      institution: string | null
    }
  }
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  CONFERENCE: 'Conferência',
  WORKSHOP: 'Workshop',
  SEMINAR: 'Seminário',
  COURSE: 'Curso',
  WEBINAR: 'Webinar',
  SYMPOSIUM: 'Simpósio',
  CONGRESS: 'Congresso',
  OTHER: 'Outro',
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const isValid =
    !certificate.validUntil || new Date(certificate.validUntil) > new Date()

  return (
    <Card
      variant="bordered"
      className="hover:shadow-md transition-shadow h-full flex flex-col"
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="purple" size="sm">
                <Award className="w-3 h-3 mr-1" aria-hidden="true" />
                {certificate.role}
              </Badge>
              <Badge variant="orange-outline" size="sm">
                {EVENT_TYPE_LABELS[certificate.event.type] || certificate.event.type}
              </Badge>
              {isValid ? (
                <Badge variant="success" size="sm">
                  Válido
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  Expirado
                </Badge>
              )}
            </div>

            <Link
              href={`/certificates/${certificate.id}`}
              className="group"
              aria-label={`Ver detalhes do certificado de ${certificate.event.title}`}
            >
              <h3 className="text-lg font-semibold text-foreground group-hover:text-ninma-purple transition-colors line-clamp-2">
                {certificate.event.title}
              </h3>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <time dateTime={certificate.event.startDate}>
              {formatDate(certificate.event.startDate)} -{' '}
              {formatDate(certificate.event.endDate)}
            </time>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>{certificate.workload} horas</span>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Código: <code className="font-mono">{certificate.verificationCode}</code>
            </p>
            <p className="text-xs text-muted-foreground">
              Emitido em {formatDate(certificate.issuedAt)}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter divider className="gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <Link href={`/certificates/${certificate.id}`}>
            Ver Detalhes
          </Link>
        </Button>
        <Button
          asChild
          variant="primary"
          size="sm"
          className="flex-1"
        >
          <Link href={`/api/certificates/${certificate.id}/download`} target="_blank">
            <Download className="w-4 h-4 mr-1" aria-hidden="true" />
            Baixar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
