import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { eventService } from '@/services/event.service'
import { SubmissionForm } from '@/components/submissions/SubmissionForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { AlertCircle } from 'lucide-react'

interface PageProps {
  searchParams: {
    eventId?: string
  }
}

export default async function NewSubmissionPage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const { eventId } = searchParams

  if (!eventId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card variant="bordered">
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">
                Evento não especificado
              </h2>
              <p className="text-muted-foreground">
                Por favor, selecione um evento antes de submeter um trabalho.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get event details
  const event = await eventService.getEventById(eventId)

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card variant="bordered">
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">
                Evento não encontrado
              </h2>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if event allows submissions
  if (!event.allowSubmissions) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card variant="bordered">
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">
                Submissões não permitidas
              </h2>
              <p className="text-muted-foreground">
                Este evento não aceita submissões de trabalhos acadêmicos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check submission period
  const now = new Date()
  if (event.submissionStart && now < event.submissionStart) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card variant="bordered">
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-warning mx-auto" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">
                Período de submissão não iniciado
              </h2>
              <p className="text-muted-foreground">
                O período de submissão para este evento ainda não começou.
              </p>
              {event.submissionStart && (
                <p className="text-sm text-muted-foreground">
                  Início: {new Date(event.submissionStart).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (event.submissionEnd && now > event.submissionEnd) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card variant="bordered">
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">
                Período de submissão encerrado
              </h2>
              <p className="text-muted-foreground">
                O período de submissão para este evento já encerrou.
              </p>
              {event.submissionEnd && (
                <p className="text-sm text-muted-foreground">
                  Encerramento: {new Date(event.submissionEnd).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nova Submissão</h1>
          <p className="text-muted-foreground mt-2">
            Submeta seu trabalho acadêmico para o evento: <strong>{event.title}</strong>
          </p>
        </div>

        {/* Guidelines */}
        {event.submissionGuidelines && (
          <Card variant="bordered">
            <CardHeader>
              <CardTitle as="h2">Diretrizes para Submissão</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: event.submissionGuidelines }}
              />
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle as="h2">Dados do Trabalho</CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios para submeter seu trabalho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubmissionForm eventId={eventId} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
