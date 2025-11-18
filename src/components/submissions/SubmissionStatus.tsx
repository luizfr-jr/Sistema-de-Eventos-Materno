'use client'

import { SubmissionStatus as Status } from '@prisma/client'
import { Badge } from '@/components/ui/Badge'
import { FileText, Clock, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface SubmissionStatusProps {
  status: Status
  showIcon?: boolean
  showWorkflow?: boolean
}

const STATUS_CONFIG: Record<
  Status,
  {
    label: string
    variant: any
    icon: any
    description: string
  }
> = {
  DRAFT: {
    label: 'Rascunho',
    variant: 'outline',
    icon: FileText,
    description: 'Trabalho em rascunho, ainda não enviado',
  },
  SUBMITTED: {
    label: 'Enviado',
    variant: 'info',
    icon: Clock,
    description: 'Trabalho enviado, aguardando avaliação',
  },
  UNDER_REVIEW: {
    label: 'Em Avaliação',
    variant: 'warning',
    icon: Eye,
    description: 'Trabalho sendo avaliado pelos revisores',
  },
  APPROVED: {
    label: 'Aprovado',
    variant: 'success',
    icon: CheckCircle,
    description: 'Trabalho aprovado',
  },
  REJECTED: {
    label: 'Rejeitado',
    variant: 'destructive',
    icon: XCircle,
    description: 'Trabalho rejeitado',
  },
  REVISION: {
    label: 'Revisão Solicitada',
    variant: 'purple',
    icon: AlertCircle,
    description: 'Revisões solicitadas pelos avaliadores',
  },
}

export function SubmissionStatus({
  status,
  showIcon = true,
  showWorkflow = false,
}: SubmissionStatusProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  if (showWorkflow) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {showIcon && <Icon className="w-5 h-5" aria-hidden="true" />}
          <Badge variant={config.variant} size="md">
            {config.label}
          </Badge>
        </div>

        <div className="relative">
          {/* Workflow visualization */}
          <div className="flex items-center justify-between">
            {[
              Status.DRAFT,
              Status.SUBMITTED,
              Status.UNDER_REVIEW,
              Status.APPROVED,
            ].map((s, index) => {
              const stepConfig = STATUS_CONFIG[s]
              const StepIcon = stepConfig.icon
              const isActive = s === status
              const isPast =
                (s === Status.DRAFT && status !== Status.DRAFT) ||
                (s === Status.SUBMITTED &&
                  [Status.UNDER_REVIEW, Status.APPROVED, Status.REJECTED, Status.REVISION].includes(
                    status
                  )) ||
                (s === Status.UNDER_REVIEW &&
                  [Status.APPROVED, Status.REJECTED, Status.REVISION].includes(status))

              return (
                <div key={s} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${
                        isActive
                          ? 'bg-ninma-purple text-white'
                          : isPast
                          ? 'bg-ninma-purple/20 text-ninma-purple'
                          : 'bg-muted text-muted-foreground'
                      }
                    `}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <StepIcon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span
                    className={`text-xs text-center ${
                      isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {stepConfig.label}
                  </span>
                  {index < 3 && (
                    <div
                      className={`absolute top-5 h-0.5 w-full ${
                        isPast ? 'bg-ninma-purple' : 'bg-muted'
                      }`}
                      style={{
                        left: `${((index + 1) / 4) * 100}%`,
                        width: `${100 / 4}%`,
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Show rejection/revision badges if applicable */}
          {(status === Status.REJECTED || status === Status.REVISION) && (
            <div className="mt-6 flex justify-center">
              <Badge variant={config.variant} size="md">
                <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                {config.label}
              </Badge>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          {config.description}
        </p>
      </div>
    )
  }

  return (
    <Badge variant={config.variant} size="md" aria-label={`Status: ${config.label}`}>
      {showIcon && <Icon className="w-4 h-4 mr-2" aria-hidden="true" />}
      {config.label}
    </Badge>
  )
}
