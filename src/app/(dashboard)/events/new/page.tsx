import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { EventForm } from '@/components/events/EventForm'
import { UserRole } from '@prisma/client'

export default async function NewEventPage() {
  const session = await auth()

  // Check if user is authenticated
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/events/new')
  }

  // Check if user has permission to create events
  const userRole = (session.user as any).role
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.COORDINATOR) {
    redirect('/events')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/events" aria-label="Voltar para eventos">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Voltar
          </Link>
        </Button>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Criar Novo Evento
        </h1>
        <p className="text-muted-foreground">
          Preencha as informações abaixo para criar um novo evento acadêmico
        </p>
      </div>

      {/* Form */}
      <EventForm mode="create" />
    </div>
  )
}

export const metadata = {
  title: 'Novo Evento | ninma hub',
  description: 'Criar um novo evento acadêmico',
}
