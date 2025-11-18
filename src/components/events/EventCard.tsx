'use client'

import Link from 'next/link'
import { CalendarDays, MapPin, Users, Clock, Globe } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, truncate } from '@/lib/utils'
import { EventStatus, EventType } from '@prisma/client'

interface EventCardProps {
  event: {
    id: string
    title: string
    slug: string
    shortDesc?: string | null
    description: string
    type: EventType
    status: EventStatus
    startDate: Date | string
    endDate: Date | string
    location: string
    isOnline: boolean
    capacity?: number | null
    image?: string | null
    _count?: {
      registrations: number
    }
  }
  showActions?: boolean
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  CONFERENCE: 'Conferência',
  WORKSHOP: 'Workshop',
  SEMINAR: 'Seminário',
  COURSE: 'Curso',
  WEBINAR: 'Webinar',
  SYMPOSIUM: 'Simpósio',
  CONGRESS: 'Congresso',
  OTHER: 'Outro',
}

const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Rascunho',
  OPEN: 'Aberto',
  CLOSED: 'Encerrado',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

const EVENT_STATUS_VARIANTS: Record<EventStatus, any> = {
  DRAFT: 'outline',
  OPEN: 'success',
  CLOSED: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'purple',
  CANCELLED: 'destructive',
}

export function EventCard({ event, showActions = true }: EventCardProps) {
  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const registrationCount = event._count?.registrations || 0
  const isFull = event.capacity ? registrationCount >= event.capacity : false

  return (
    <Card variant="bordered" className="hover:shadow-md transition-shadow">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={EVENT_STATUS_VARIANTS[event.status]} size="sm">
                {EVENT_STATUS_LABELS[event.status]}
              </Badge>
              <Badge variant="purple-outline" size="sm">
                {EVENT_TYPE_LABELS[event.type]}
              </Badge>
              {event.isOnline && (
                <Badge variant="teal-outline" size="sm">
                  <Globe className="w-3 h-3 mr-1" aria-hidden="true" />
                  Online
                </Badge>
              )}
              {isFull && (
                <Badge variant="destructive" size="sm">
                  Lotado
                </Badge>
              )}
            </div>

            <Link
              href={`/events/${event.id}`}
              className="group"
              aria-label={`Ver detalhes de ${event.title}`}
            >
              <h3 className="text-xl font-semibold text-foreground group-hover:text-ninma-purple transition-colors line-clamp-2">
                {event.title}
              </h3>
            </Link>
          </div>
        </div>

        {event.shortDesc && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {truncate(event.shortDesc, 150)}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <time dateTime={startDate.toISOString()}>
              {formatDate(startDate, true)}
            </time>
            {startDate.toDateString() !== endDate.toDateString() && (
              <>
                <span>-</span>
                <time dateTime={endDate.toISOString()}>
                  {formatDate(endDate, true)}
                </time>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {event.capacity && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>
                {registrationCount} / {event.capacity} inscritos
              </span>
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-ninma-purple h-full transition-all"
                  style={{
                    width: `${Math.min((registrationCount / event.capacity) * 100, 100)}%`,
                  }}
                  role="progressbar"
                  aria-valuenow={registrationCount}
                  aria-valuemin={0}
                  aria-valuemax={event.capacity}
                  aria-label="Vagas preenchidas"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter divider className="gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Link href={`/events/${event.id}`}>
              Ver Detalhes
            </Link>
          </Button>
          {event.status === EventStatus.OPEN && !isFull && (
            <Button
              asChild
              variant="primary"
              size="sm"
              className="flex-1"
            >
              <Link href={`/events/${event.id}`}>
                Inscrever-se
              </Link>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
