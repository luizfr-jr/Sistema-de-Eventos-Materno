'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Check, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'

export default function QRScanPage() {
  const [scanning, setScanning] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setScanning(true)
        setError(null)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Erro ao acessar câmera. Verifique as permissões.')
      toast.error('Erro ao acessar câmera')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }

  const handleManualInput = async () => {
    const qrData = prompt('Cole os dados do QR Code:')
    if (!qrData) return

    await processQRCode(qrData)
  }

  const processQRCode = async (qrData: string) => {
    setProcessing(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/attendances/qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'checkin',
          qrData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar QR Code')
      }

      setResult({
        success: true,
        participant: data.attendance.registration.user,
        checkinAt: data.attendance.checkinAt,
      })

      toast.success('Check-in realizado com sucesso!')
      stopCamera()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao processar QR Code'
      setError(errorMessage)
      toast.error(errorMessage)
      setResult({
        success: false,
        error: errorMessage,
      })
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/attendances" aria-label="Voltar">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Voltar
          </Link>
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          Scanner QR Code
        </h1>
        <p className="text-muted-foreground">
          Escaneie o QR Code do participante para realizar check-in
        </p>
      </div>

      {/* Scanner Card */}
      <Card className="mb-6">
        <CardHeader divider>
          <CardTitle>Scanner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scanning && !result && (
            <div className="text-center py-12">
              <Camera
                className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20"
                aria-hidden="true"
              />
              <p className="text-muted-foreground mb-6">
                Clique no botão abaixo para iniciar o scanner
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={startCamera} size="lg">
                  <Camera className="h-5 w-5 mr-2" aria-hidden="true" />
                  Iniciar Scanner
                </Button>
                <Button onClick={handleManualInput} variant="outline" size="lg">
                  Entrada Manual
                </Button>
              </div>
            </div>
          )}

          {scanning && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {processing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2" />
                      <p>Processando...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={stopCamera} variant="outline" className="flex-1">
                  Parar Scanner
                </Button>
                <Button onClick={handleManualInput} variant="outline" className="flex-1">
                  Entrada Manual
                </Button>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Posicione o QR Code dentro do quadro para escanear automaticamente
                </p>
              </div>
            </div>
          )}

          {error && !result && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Erro</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div
              className={`border rounded-lg p-6 ${
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    result.success ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {result.success ? (
                    <Check className="h-6 w-6 text-green-600" aria-hidden="true" />
                  ) : (
                    <X className="h-6 w-6 text-red-600" aria-hidden="true" />
                  )}
                </div>

                <div className="flex-1">
                  {result.success ? (
                    <>
                      <p className="text-lg font-semibold text-green-900 mb-1">
                        Check-in realizado!
                      </p>
                      <p className="text-sm text-green-700 mb-3">
                        {result.participant.name}
                      </p>
                      <div className="space-y-1 text-sm text-green-700">
                        <p>Email: {result.participant.email}</p>
                        {result.participant.institution && (
                          <p>Instituição: {result.participant.institution}</p>
                        )}
                        <p>
                          Hora: {new Date(result.checkinAt).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-red-900 mb-1">
                        Falha no check-in
                      </p>
                      <p className="text-sm text-red-700">{result.error}</p>
                    </>
                  )}

                  <Button
                    onClick={() => {
                      setResult(null)
                      setError(null)
                      startCamera()
                    }}
                    variant={result.success ? 'primary' : 'destructive'}
                    className="mt-4"
                  >
                    Escanear Outro
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader divider>
          <CardTitle>Instruções</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Badge variant="purple" className="flex-shrink-0 h-6 w-6 p-0 flex items-center justify-center">
                1
              </Badge>
              <span>Clique em &quot;Iniciar Scanner&quot; e permita o acesso à câmera</span>
            </li>
            <li className="flex gap-3">
              <Badge variant="purple" className="flex-shrink-0 h-6 w-6 p-0 flex items-center justify-center">
                2
              </Badge>
              <span>
                Posicione o QR Code do participante dentro do quadro da câmera
              </span>
            </li>
            <li className="flex gap-3">
              <Badge variant="purple" className="flex-shrink-0 h-6 w-6 p-0 flex items-center justify-center">
                3
              </Badge>
              <span>
                O check-in será realizado automaticamente quando o QR Code for lido
              </span>
            </li>
            <li className="flex gap-3">
              <Badge variant="purple" className="flex-shrink-0 h-6 w-6 p-0 flex items-center justify-center">
                4
              </Badge>
              <span>
                Use &quot;Entrada Manual&quot; se houver problemas com a câmera
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
