'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Award,
  Download,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  Copy,
  Shield,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { CertificatePreview } from '@/components/certificates/CertificatePreview'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Certificate {
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
    location: string
    type: string
    workload: number | null
  }
  user: {
    id: string
    name: string
    email: string
    institution: string | null
  }
  registration: {
    id: string
    status: string
    confirmedAt: string | null
  }
}

export default function CertificateDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchCertificate()
  }, [params.id])

  const fetchCertificate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/certificates/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Certificado não encontrado')
          router.push('/certificates')
          return
        }
        throw new Error('Erro ao buscar certificado')
      }

      const data = await response.json()
      setCertificate(data)
    } catch (error) {
      console.error('Error fetching certificate:', error)
      toast.error('Erro ao carregar certificado')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      setDownloading(true)
      const response = await fetch(`/api/certificates/${params.id}/download`)

      if (!response.ok) {
        throw new Error('Erro ao baixar certificado')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificado-${certificate?.verificationCode}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Certificado baixado com sucesso!')
    } catch (error) {
      console.error('Error downloading certificate:', error)
      toast.error('Erro ao baixar certificado')
    } finally {
      setDownloading(false)
    }
  }

  const copyVerificationCode = () => {
    if (certificate) {
      navigator.clipboard.writeText(certificate.verificationCode)
      toast.success('Código copiado!')
    }
  }

  const copyVerificationUrl = () => {
    if (certificate) {
      const url = `${window.location.origin}/certificates/verify/${certificate.verificationCode}`
      navigator.clipboard.writeText(url)
      toast.success('Link de verificação copiado!')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  if (!certificate) {
    return null
  }

  const isValid = !certificate.validUntil || new Date(certificate.validUntil) > new Date()

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
      {/* Back Button */}
      <Button asChild variant="outline" size="sm">
        <Link href="/certificates">
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Voltar
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-ninma-purple" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-foreground">
            Detalhes do Certificado
          </h1>
        </div>
        <p className="text-muted-foreground">
          Certificado de {certificate.role}
        </p>
      </div>

      {/* Certificate Preview */}
      <CertificatePreview certificate={certificate} />

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          variant="primary"
          size="lg"
          className="flex-1 sm:flex-none"
        >
          {downloading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Baixando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              Baixar PDF
            </>
          )}
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="flex-1 sm:flex-none"
        >
          <Link href={`/certificates/verify/${certificate.verificationCode}`}>
            <Shield className="w-4 h-4 mr-2" aria-hidden="true" />
            Verificar Autenticidade
          </Link>
        </Button>
      </div>

      {/* Certificate Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Information */}
        <Card variant="bordered">
          <CardHeader divider>
            <CardTitle as="h2" className="text-xl">
              Informações do Evento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Evento</p>
              <Link
                href={`/events/${certificate.event.id}`}
                className="font-semibold text-ninma-purple hover:underline flex items-center gap-1"
              >
                {certificate.event.title}
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span>
                {formatDate(certificate.event.startDate)} até{' '}
                {formatDate(certificate.event.endDate)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span>{certificate.event.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span>{certificate.workload} horas</span>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Information */}
        <Card variant="bordered">
          <CardHeader divider>
            <CardTitle as="h2" className="text-xl">
              Informações do Certificado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Participante</p>
              <p className="font-semibold">{certificate.user.name}</p>
              {certificate.user.institution && (
                <p className="text-sm text-muted-foreground">
                  {certificate.user.institution}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Função</p>
              <Badge variant="purple">{certificate.role}</Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Emitido em</p>
              <p className="text-sm">{formatDate(certificate.issuedAt)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Validade</p>
              <div className="flex items-center gap-2">
                {isValid ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
                    <span className="text-sm text-green-600">
                      Válido {certificate.validUntil ? `até ${formatDate(certificate.validUntil)}` : 'permanentemente'}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-red-600">
                    Expirado em {certificate.validUntil && formatDate(certificate.validUntil)}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification */}
      <Card variant="bordered">
        <CardHeader divider>
          <CardTitle as="h2" className="text-xl">
            Verificação de Autenticidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Código de Verificação
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm">
                {certificate.verificationCode}
              </code>
              <Button
                onClick={copyVerificationCode}
                variant="outline"
                size="sm"
                aria-label="Copiar código"
              >
                <Copy className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Link de Verificação
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-xs break-all">
                {window.location.origin}/certificates/verify/{certificate.verificationCode}
              </code>
              <Button
                onClick={copyVerificationUrl}
                variant="outline"
                size="sm"
                aria-label="Copiar link"
              >
                <Copy className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Use o código ou link acima para verificar a autenticidade deste certificado.
            O QR Code no certificado PDF também pode ser escaneado para verificação.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
