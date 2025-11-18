import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Globe,
  FileText,
  Award,
  Edit,
  Trash2,
} from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { eventService } from '@/services/event.service'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { RegistrationButton } from '@/components/events/RegistrationButton'
import { formatDate, formatTime } from '@/lib/utils'
import { EventStatus, EventType, UserRole } from '@prisma/client'

interface PageProps {
  params: {
    id: string
  }
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

export default async function EventDetailsPage({ params }: PageProps) {
  const session = await auth()
  const event = await eventService.getEventById(params.id)

  if (!event) {
    notFound()
  }

  const stats = await eventService.getEventStats(params.id)
  const { canRegister, reason } = await eventService.canRegister(params.id)

  // Check if user can manage this event
  let canManage = false
  if (session?.user) {
    canManage = await eventService.canUserManageEvent(session.user.id!, params.id)
  }

  // Get current user's registration if logged in
  let currentRegistration = null
  if (session?.user) {
    currentRegistration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id!,
        },
      },
    })
  }

  const startDate = new Date(event.startDate)
  const endDate = new Date(event.endDate)
  const isSameDay = startDate.toDateString() === endDate.toDateString()

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/events" aria-label="Voltar para eventos">
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Voltar
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Badge variant={EVENT_STATUS_VARIANTS[event.status]}>
                {EVENT_STATUS_LABELS[event.status]}
              </Badge>
              <Badge variant="purple-outline">
                {EVENT_TYPE_LABELS[event.type]}
              </Badge>
              {event.isOnline && (
                <Badge variant="teal-outline">
                  <Globe className="w-3 h-3 mr-1" aria-hidden="true" />
                  Online
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {event.title}
            </h1>

            {event.shortDesc && (
              <p className="text-lg text-muted-foreground mb-4">
                {event.shortDesc}
              </p>
            )}

            {/* Management Actions */}
            {canManage && (
              <div className="flex gap-2 mb-6">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/events/${event.id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                    Editar
                  </Link>
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  Excluir
                </Button>
              </div>
            )}
          </div>

          {/* Event Info */}
          <Card>
            <CardHeader divider>
              <CardTitle>Informações do Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-ninma-purple mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Data e Horário</p>
                  <time dateTime={startDate.toISOString()} className="text-sm text-muted-foreground">
                    {formatDate(startDate)} às {formatTime(startDate)}
                  </time>
                  {!isSameDay && (
                    <>
                      <br />
                      <time dateTime={endDate.toISOString()} className="text-sm text-muted-foreground">
                        até {formatDate(endDate)} às {formatTime(endDate)}
                      </time>
                    </>
                  )}
                  {isSameDay && (
                    <>
                      {' - '}
                      <time dateTime={endDate.toISOString()} className="text-sm text-muted-foreground">
                        {formatTime(endDate)}
                      </time>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-ninma-purple mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Local</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                  {event.address && (
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                  )}
                  {event.city && event.state && (
                    <p className="text-sm text-muted-foreground">
                      {event.city}, {event.state}
                    </p>
                  )}
                  {event.isOnline && event.meetingUrl && (
                    <a
                      href={event.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ninma-purple hover:underline mt-1 inline-block"
                    >
                      Acessar reunião online
                    </a>
                  )}
                </div>
              </div>

              {event.capacity && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-ninma-purple mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Vagas</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.registrations.confirmed} / {event.capacity} inscritos
                    </p>
                    <div className="mt-2 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-ninma-purple h-full transition-all"
                        style={{
                          width: `${Math.min((stats.registrations.confirmed / event.capacity) * 100, 100)}%`,
                        }}
                        role="progressbar"
                        aria-valuenow={stats.registrations.confirmed}
                        aria-valuemin={0}
                        aria-valuemax={event.capacity}
                        aria-label="Vagas preenchidas"
                      />
                    </div>
                  </div>
                </div>
              )}

              {event.workload && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-ninma-purple mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-foreground">Carga Horária</p>
                    <p className="text-sm text-muted-foreground">{event.workload} horas</p>
                  </div>
                </div>
              )}

              {event.issueCertificates && (
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-ninma-purple mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-foreground">Certificado</p>
                    <p className="text-sm text-muted-foreground">
                      Certificado disponível após conclusão
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader divider>
              <CardTitle>Sobre o Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submission Guidelines */}
          {event.allowSubmissions && event.submissionGuidelines && (
            <Card>
              <CardHeader divider>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" aria-hidden="true" />
                  Diretrizes para Submissão de Trabalhos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.submissionGuidelines}
                  </p>
                </div>
                {event.submissionStart && event.submissionEnd && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium text-foreground">
                      Período de Submissões:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.submissionStart)} até{' '}
                      {formatDate(event.submissionEnd)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tags and Keywords */}
          {((event.tags && event.tags.length > 0) ||
            (event.keywords && event.keywords.length > 0)) && (
            <Card>
              <CardContent className="pt-6">
                {event.tags && event.tags.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="purple-outline" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {event.keywords && event.keywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">
                      Palavras-chave:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {event.keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" size="sm">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration */}
          <Card>
            <CardHeader divider>
              <CardTitle>Inscrição</CardTitle>
            </CardHeader>
            <CardContent>
              <RegistrationButton
                eventId={event.id}
                eventTitle={event.title}
                canRegister={canRegister}
                canRegisterReason={reason}
                currentRegistration={currentRegistration}
                isAuthenticated={!!session?.user}
              />
            </CardContent>
          </Card>

          {/* Registration Period */}
          {event.allowRegistrations &&
            event.registrationStart &&
            event.registrationEnd && (
              <Card>
                <CardHeader divider>
                  <CardTitle>Período de Inscrições</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Início:</p>
                    <time
                      dateTime={new Date(event.registrationStart).toISOString()}
                      className="text-sm text-muted-foreground"
                    >
                      {formatDate(event.registrationStart, true)}
                    </time>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Término:</p>
                    <time
                      dateTime={new Date(event.registrationEnd).toISOString()}
                      className="text-sm text-muted-foreground"
                    >
                      {formatDate(event.registrationEnd, true)}
                    </time>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Statistics */}
          {canManage && (
            <Card>
              <CardHeader divider>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de Inscrições:</span>
                  <span className="font-semibold">{stats.registrations.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Confirmadas:</span>
                  <span className="font-semibold text-green-600">
                    {stats.registrations.confirmed}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pendentes:</span>
                  <span className="font-semibold text-yellow-600">
                    {stats.registrations.pending}
                  </span>
                </div>
                {event.allowSubmissions && (
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-sm text-muted-foreground">Trabalhos Enviados:</span>
                    <span className="font-semibold">{stats.submissions}</span>
                  </div>
                )}
                {event.issueCertificates && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Certificados Emitidos:</span>
                    <span className="font-semibold">{stats.certificates}</span>
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link href={`/events/${event.id}/registrations`}>
                    Ver Inscrições
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Organizer */}
          <Card>
            <CardHeader divider>
              <CardTitle>Organizador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {event.createdBy.image && (
                  <img
                    src={event.createdBy.image}
                    alt={event.createdBy.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium text-foreground">{event.createdBy.name}</p>
                  <p className="text-sm text-muted-foreground">{event.createdBy.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const event = await eventService.getEventById(params.id)

  if (!event) {
    return {
      title: 'Evento não encontrado | ninma hub',
    }
  }

  return {
    title: `${event.title} | ninma hub`,
    description: event.shortDesc || event.description.substring(0, 160),
  }
}
