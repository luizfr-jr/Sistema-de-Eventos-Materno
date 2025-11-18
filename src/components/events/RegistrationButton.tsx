'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { showToast } from '@/components/ui/Toast'
import { RegistrationStatus } from '@prisma/client'

interface RegistrationButtonProps {
  eventId: string
  eventTitle: string
  canRegister: boolean
  canRegisterReason?: string
  currentRegistration?: {
    id: string
    status: RegistrationStatus
    notes?: string | null
    dietaryRestrictions?: string | null
  } | null
  isAuthenticated: boolean
}

export function RegistrationButton({
  eventId,
  eventTitle,
  canRegister,
  canRegisterReason,
  currentRegistration,
  isAuthenticated,
}: RegistrationButtonProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    notes: currentRegistration?.notes || '',
    dietaryRestrictions: currentRegistration?.dietaryRestrictions || '',
  })

  const handleRegister = async () => {
    if (!isAuthenticated) {
      showToast.error('Você precisa estar autenticado para se inscrever')
      router.push('/auth/login')
      return
    }

    if (!canRegister) {
      showToast.error(canRegisterReason || 'Não é possível se inscrever neste evento')
      return
    }

    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar inscrição')
      }

      showToast.success(data.message || 'Inscrição realizada com sucesso!')
      setIsModalOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error registering:', error)
      showToast.error((error as Error).message || 'Erro ao realizar inscrição')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelRegistration = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua inscrição?')) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao cancelar inscrição')
      }

      showToast.success('Inscrição cancelada com sucesso!')
      router.refresh()
    } catch (error) {
      console.error('Error canceling registration:', error)
      showToast.error((error as Error).message || 'Erro ao cancelar inscrição')
    } finally {
      setIsLoading(false)
    }
  }

  // Show registration status if user is already registered
  if (currentRegistration && currentRegistration.status !== RegistrationStatus.CANCELLED) {
    const statusConfig = {
      [RegistrationStatus.PENDING]: {
        icon: <Clock className="w-5 h-5" aria-hidden="true" />,
        label: 'Inscrição Pendente',
        variant: 'warning' as const,
        message: 'Sua inscrição está aguardando aprovação',
      },
      [RegistrationStatus.CONFIRMED]: {
        icon: <CheckCircle2 className="w-5 h-5" aria-hidden="true" />,
        label: 'Inscrito',
        variant: 'success' as const,
        message: 'Você está inscrito neste evento',
      },
      [RegistrationStatus.ATTENDED]: {
        icon: <CheckCircle2 className="w-5 h-5" aria-hidden="true" />,
        label: 'Presença Confirmada',
        variant: 'success' as const,
        message: 'Sua presença foi registrada',
      },
      [RegistrationStatus.ABSENT]: {
        icon: <XCircle className="w-5 h-5" aria-hidden="true" />,
        label: 'Ausente',
        variant: 'destructive' as const,
        message: 'Você não compareceu ao evento',
      },
      [RegistrationStatus.WAITLIST]: {
        icon: <Clock className="w-5 h-5" aria-hidden="true" />,
        label: 'Lista de Espera',
        variant: 'info' as const,
        message: 'Você está na lista de espera',
      },
      [RegistrationStatus.CANCELLED]: {
        icon: <XCircle className="w-5 h-5" aria-hidden="true" />,
        label: 'Cancelada',
        variant: 'destructive' as const,
        message: 'Sua inscrição foi cancelada',
      },
    }

    const config = statusConfig[currentRegistration.status]

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-current bg-background">
          <div className={`text-${config.variant}`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{config.label}</p>
            <p className="text-sm text-muted-foreground">{config.message}</p>
          </div>
        </div>
        {(currentRegistration.status === RegistrationStatus.PENDING ||
          currentRegistration.status === RegistrationStatus.CONFIRMED) && (
          <Button
            variant="outline"
            onClick={handleCancelRegistration}
            isLoading={isLoading}
            className="w-full"
            aria-label="Cancelar inscrição"
          >
            Cancelar Inscrição
          </Button>
        )}
      </div>
    )
  }

  // Show registration button
  return (
    <>
      <Button
        variant="primary"
        size="lg"
        onClick={handleRegister}
        disabled={!canRegister || !isAuthenticated}
        className="w-full"
        aria-label={`Inscrever-se em ${eventTitle}`}
      >
        {!isAuthenticated
          ? 'Faça login para se inscrever'
          : !canRegister
          ? canRegisterReason || 'Inscrições não disponíveis'
          : 'Inscrever-se no Evento'}
      </Button>

      {/* Registration Modal */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Inscrição no Evento</ModalTitle>
            <ModalDescription>
              Complete sua inscrição em {eventTitle}
            </ModalDescription>
          </ModalHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium text-foreground">
              Observações
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ninma-purple focus-visible:ring-offset-2"
              placeholder="Informações adicionais (opcional)"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {formData.notes.length}/500 caracteres
            </p>
          </div>

          <div>
            <label htmlFor="dietaryRestrictions" className="mb-2 block text-sm font-medium text-foreground">
              Restrições Alimentares
            </label>
            <textarea
              id="dietaryRestrictions"
              name="dietaryRestrictions"
              value={formData.dietaryRestrictions}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dietaryRestrictions: e.target.value,
                }))
              }
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ninma-purple focus-visible:ring-offset-2"
              placeholder="Ex: vegetariano, intolerância ao glúten, etc."
              maxLength={200}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {formData.dietaryRestrictions.length}/200 caracteres
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="flex-1"
            >
              Confirmar Inscrição
            </Button>
          </div>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}
