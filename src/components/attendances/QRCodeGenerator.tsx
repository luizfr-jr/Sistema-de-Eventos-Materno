'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { QrCode, Download, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface QRCodeGeneratorProps {
  eventId: string
}

export function QRCodeGenerator({ eventId }: QRCodeGeneratorProps) {
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [participantName, setParticipantName] = useState<string>('')

  const handleSearch = async () => {
    if (!search.trim()) {
      toast.error('Digite um nome ou email para buscar')
      return
    }

    setSearching(true)
    setQrCode(null)
    try {
      const response = await fetch(
        `/api/events/${eventId}/registrations?search=${encodeURIComponent(search)}&status=CONFIRMED&limit=1`
      )

      if (!response.ok) {
        throw new Error('Erro ao buscar participante')
      }

      const data = await response.json()
      const registrations = data.registrations || []

      if (registrations.length === 0) {
        toast.error('Participante não encontrado ou não confirmado')
        return
      }

      const registration = registrations[0]
      setParticipantName(registration.user.name)

      // Generate QR code
      await generateQRCode(registration.id)
    } catch (error) {
      console.error('Error searching:', error)
      toast.error('Erro ao buscar participante')
    } finally {
      setSearching(false)
    }
  }

  const generateQRCode = async (registrationId: string) => {
    setGenerating(true)
    try {
      const response = await fetch('/api/attendances/qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          registrationId,
          eventId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar QR Code')
      }

      setQrCode(data.qrCode)
      toast.success('QR Code gerado com sucesso')
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao gerar QR Code'
      )
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!qrCode) return

    const link = document.createElement('a')
    link.href = qrCode
    link.download = `qrcode-${participantName.replace(/\s+/g, '-').toLowerCase()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR Code baixado')
  }

  return (
    <Card>
      <CardHeader divider>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" aria-hidden="true" />
          Gerar QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Nome ou email do participante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              disabled={searching || generating}
              aria-label="Buscar participante"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching || generating || !search.trim()}
            aria-label="Buscar"
          >
            {searching ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Search className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        {generating && (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {qrCode && !generating && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border-2 border-ninma-purple/20 flex items-center justify-center">
              <img
                src={qrCode}
                alt={`QR Code para ${participantName}`}
                className="w-64 h-64"
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                {participantName}
              </p>
              <p className="text-xs text-muted-foreground">
                QR Code válido por 24 horas
              </p>
            </div>

            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              Baixar QR Code
            </Button>
          </div>
        )}

        {!qrCode && !generating && (
          <div className="text-center py-12 text-muted-foreground">
            <QrCode className="h-12 w-12 mx-auto mb-3 opacity-20" aria-hidden="true" />
            <p className="text-sm">
              Busque um participante para gerar o QR Code
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
