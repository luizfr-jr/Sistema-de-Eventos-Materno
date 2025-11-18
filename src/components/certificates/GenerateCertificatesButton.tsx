'use client'

import { useState } from 'react'
import { Award, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'

interface GenerateCertificatesButtonProps {
  eventId: string
  eventTitle: string
  onSuccess?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const ROLE_OPTIONS = [
  { value: 'Participante', label: 'Participante' },
  { value: 'Palestrante', label: 'Palestrante' },
  { value: 'Coordenador', label: 'Coordenador' },
  { value: 'Organizador', label: 'Organizador' },
  { value: 'Avaliador', label: 'Avaliador' },
  { value: 'Autor', label: 'Autor' },
]

export function GenerateCertificatesButton({
  eventId,
  eventTitle,
  onSuccess,
  variant = 'primary',
  size = 'md',
  className,
}: GenerateCertificatesButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [selectedRole, setSelectedRole] = useState('Participante')

  const handleGenerate = async () => {
    try {
      setGenerating(true)

      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          role: selectedRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar certificados')
      }

      if (data.generated === 0) {
        toast.success(data.message || 'Nenhum certificado para gerar')
      } else {
        toast.success(
          `${data.generated} certificado(s) gerado(s) com sucesso!`,
          { duration: 5000 }
        )

        // Show errors if any
        if (data.errors && data.errors.length > 0) {
          console.warn('Errors generating some certificates:', data.errors)
          toast.error(
            `${data.errors.length} erro(s) ao gerar alguns certificados`,
            { duration: 5000 }
          )
        }

        onSuccess?.()
      }

      setIsOpen(false)
    } catch (error) {
      console.error('Error generating certificates:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao gerar certificados'
      )
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <Award className="w-4 h-4 mr-2" aria-hidden="true" />
        Gerar Certificados
      </Button>

      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Gerar Certificados</ModalTitle>
            <ModalDescription>
              Gerar certificados para todos os participantes confirmados do evento.
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-medium mb-2">Evento</p>
              <p className="text-sm text-muted-foreground">{eventTitle}</p>
            </div>

            <div>
              <label
                htmlFor="role-select"
                className="text-sm font-medium mb-2 block"
              >
                Função dos Participantes
              </label>
              <select
                id="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ninma-purple focus:border-transparent"
                disabled={generating}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-2">
                Esta função aparecerá nos certificados gerados
              </p>
            </div>

            <div className="p-4 bg-ninma-purple/10 border border-ninma-purple/20 rounded-lg">
              <p className="text-sm text-foreground">
                Os certificados serão gerados para todos os participantes com
                status <Badge variant="success" size="sm">Confirmado</Badge> ou{' '}
                <Badge variant="info" size="sm">Presente</Badge> que ainda não
                possuem certificado.
              </p>
            </div>
          </div>

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={generating}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Gerando...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" aria-hidden="true" />
                  Gerar Certificados
                </>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
