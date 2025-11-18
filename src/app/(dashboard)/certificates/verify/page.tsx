'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  Search,
  CheckCircle,
  XCircle,
  Award,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface VerificationResult {
  valid: boolean
  reason?: string
  certificate?: {
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
    }
    user: {
      id: string
      name: string
      institution: string | null
    }
  }
}

export default function VerifyCertificatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const codeParam = searchParams.get('code')

  const [code, setCode] = useState(codeParam || '')
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!code.trim()) {
      toast.error('Digite um código de verificação')
      return
    }

    try {
      setVerifying(true)
      setResult(null)

      const response = await fetch(`/api/certificates/verify/${code.trim()}`)
      const data = await response.json()

      if (!response.ok) {
        setResult({
          valid: false,
          reason: data.error || 'Erro ao verificar certificado',
        })
        return
      }

      setResult(data)

      if (data.valid) {
        toast.success('Certificado válido!')
      } else {
        toast.error(data.reason || 'Certificado inválido')
      }
    } catch (error) {
      console.error('Error verifying certificate:', error)
      setResult({
        valid: false,
        reason: 'Erro ao verificar certificado. Tente novamente.',
      })
      toast.error('Erro ao verificar certificado')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-10 h-10 text-ninma-purple" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Verificar Certificado
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Digite o código de verificação do certificado para confirmar sua autenticidade.
          O código pode ser encontrado no certificado PDF ou escaneando o QR Code.
        </p>
      </div>

      {/* Verification Form */}
      <Card variant="bordered">
        <CardContent className="p-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="verification-code" className="block text-sm font-medium mb-2">
                Código de Verificação
              </label>
              <div className="flex gap-2">
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="Ex: NINMA-20240101-ABC12"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1"
                  disabled={verifying}
                  aria-label="Código de verificação"
                />
                <Button
                  type="submit"
                  disabled={verifying || !code.trim()}
                  variant="primary"
                >
                  {verifying ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" aria-hidden="true" />
                      Verificar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {result && (
        <Card
          variant="bordered"
          className={
            result.valid
              ? 'border-green-500 bg-green-50 dark:bg-green-950'
              : 'border-red-500 bg-red-50 dark:bg-red-950'
          }
        >
          <CardHeader divider>
            <div className="flex items-center gap-3">
              {result.valid ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
                  <CardTitle as="h2" className="text-xl text-green-600">
                    Certificado Válido
                  </CardTitle>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" aria-hidden="true" />
                  <CardTitle as="h2" className="text-xl text-red-600">
                    Certificado Inválido
                  </CardTitle>
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {result.valid && result.certificate ? (
              <>
                {/* Certificate Information */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Participante</p>
                    <p className="font-semibold text-lg">
                      {result.certificate.user.name}
                    </p>
                    {result.certificate.user.institution && (
                      <p className="text-sm text-muted-foreground">
                        {result.certificate.user.institution}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Evento</p>
                    <p className="font-semibold">{result.certificate.event.title}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Função</p>
                      <Badge variant="purple">{result.certificate.role}</Badge>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Carga Horária</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        {result.certificate.workload} horas
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Período do Evento</p>
                      <p className="text-sm flex items-center gap-1">
                        <Calendar className="w-4 h-4" aria-hidden="true" />
                        {formatDate(result.certificate.event.startDate)} -{' '}
                        {formatDate(result.certificate.event.endDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Local</p>
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4" aria-hidden="true" />
                        {result.certificate.event.location}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Emitido em</p>
                      <p className="text-sm">{formatDate(result.certificate.issuedAt)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Validade</p>
                      <p className="text-sm">
                        {result.certificate.validUntil
                          ? `Até ${formatDate(result.certificate.validUntil)}`
                          : 'Válido permanentemente'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Código de Verificação</p>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {result.certificate.verificationCode}
                    </code>
                  </div>
                </div>

                {/* Success Message */}
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-100">
                    <CheckCircle className="w-4 h-4 inline mr-2" aria-hidden="true" />
                    Este certificado é autêntico e foi emitido pelo ninma hub.
                    Todas as informações foram verificadas e confirmadas.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Error Message */}
                <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-100">
                    <XCircle className="w-4 h-4 inline mr-2" aria-hidden="true" />
                    {result.reason || 'Este certificado não foi encontrado em nosso sistema.'}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  Possíveis motivos:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Código de verificação incorreto</li>
                  <li>Certificado não emitido pelo ninma hub</li>
                  <li>Certificado expirado ou cancelado</li>
                  <li>Erro de digitação no código</li>
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card variant="bordered">
        <CardHeader divider>
          <CardTitle as="h2" className="text-lg">
            Como verificar?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-ninma-purple/10 rounded-lg">
              <span className="font-bold text-ninma-purple">1</span>
            </div>
            <div>
              <p className="text-sm">
                Localize o código de verificação no certificado PDF.
                Ele estará no formato NINMA-YYYYMMDD-XXXXX.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-ninma-purple/10 rounded-lg">
              <span className="font-bold text-ninma-purple">2</span>
            </div>
            <div>
              <p className="text-sm">
                Digite o código completo no campo acima ou escaneie o QR Code
                presente no certificado.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-ninma-purple/10 rounded-lg">
              <span className="font-bold text-ninma-purple">3</span>
            </div>
            <div>
              <p className="text-sm">
                Clique em "Verificar" para validar a autenticidade do certificado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
