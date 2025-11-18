import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { eventService } from '@/services/event.service'
import { Button } from '@/components/ui/Button'
import { EventForm } from '@/components/events/EventForm'

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditEventPage({ params }: PageProps) {
  const session = await auth()

  // Check if user is authenticated
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/events/${params.id}/edit`)
  }

  // Get event
  const event = await eventService.getEventById(params.id)

  if (!event) {
    notFound()
  }

  // Check if user can manage this event
  const canManage = await eventService.canUserManageEvent(
    session.user.id!,
    params.id
  )

  if (!canManage) {
    redirect('/events')
  }

  // Format dates for datetime-local input
  const formatDateTimeLocal = (date: Date | string) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Prepare initial data for the form
  const initialData = {
    title: event.title,
    description: event.description,
    shortDesc: event.shortDesc || '',
    type: event.type,
    startDate: formatDateTimeLocal(event.startDate),
    endDate: formatDateTimeLocal(event.endDate),
    location: event.location,
    address: event.address || '',
    city: event.city || '',
    state: event.state || '',
    isOnline: event.isOnline,
    meetingUrl: event.meetingUrl || '',
    capacity: event.capacity,
    allowRegistrations: event.allowRegistrations,
    registrationStart: event.registrationStart
      ? formatDateTimeLocal(event.registrationStart)
      : '',
    registrationEnd: event.registrationEnd
      ? formatDateTimeLocal(event.registrationEnd)
      : '',
    allowSubmissions: event.allowSubmissions,
    submissionStart: event.submissionStart
      ? formatDateTimeLocal(event.submissionStart)
      : '',
    submissionEnd: event.submissionEnd
      ? formatDateTimeLocal(event.submissionEnd)
      : '',
    submissionGuidelines: event.submissionGuidelines || '',
    issueCertificates: event.issueCertificates,
    workload: event.workload,
    tags: event.tags?.join(', ') || '',
    keywords: event.keywords?.join(', ') || '',
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/events/${event.id}`} aria-label="Voltar para detalhes do evento">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Voltar
          </Link>
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Editar Evento
        </h1>
        <p className="text-muted-foreground">
          Atualize as informações do evento "{event.title}"
        </p>
      </div>

      {/* Form */}
      <EventForm mode="edit" eventId={event.id} initialData={initialData} />
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
    title: `Editar ${event.title} | ninma hub`,
    description: `Editar informações do evento ${event.title}`,
  }
}
