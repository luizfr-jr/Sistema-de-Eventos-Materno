import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'
import { auth } from '@/lib/auth'
import { submissionService } from '@/services/submission.service'
import { SubmissionCard } from '@/components/submissions/SubmissionCard'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { SubmissionStatus, UserRole } from '@prisma/client'

interface PageProps {
  searchParams: {
    page?: string
    status?: SubmissionStatus
    eventId?: string
    search?: string
  }
}

async function SubmissionsList({
  searchParams,
}: {
  searchParams: PageProps['searchParams']
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const page = parseInt(searchParams.page || '1')
  const userRole = (session.user as any).role

  // Build filters
  const filters: any = {}
  if (searchParams.status) filters.status = searchParams.status
  if (searchParams.eventId) filters.eventId = searchParams.eventId
  if (searchParams.search) filters.search = searchParams.search

  // Get submissions based on user role
  let result
  if (userRole === UserRole.REVIEWER) {
    result = await submissionService.getReviewerSubmissions(session.user.id!, page, 10)
  } else if (userRole === UserRole.PARTICIPANT) {
    filters.userId = session.user.id
    result = await submissionService.listSubmissions(filters, page, 10)
  } else {
    result = await submissionService.listSubmissions(filters, page, 10)
  }

  const { submissions, pagination } = result

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="bordered">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total de Submissões</p>
              <p className="text-2xl font-bold text-foreground">{pagination.total}</p>
            </div>
          </CardContent>
        </Card>

        {userRole === UserRole.PARTICIPANT && (
          <>
            <Card variant="bordered">
              <CardContent className="pt-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Aprovadas</p>
                  <p className="text-2xl font-bold text-success">
                    {submissions.filter((s) => s.status === SubmissionStatus.APPROVED).length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card variant="bordered">
              <CardContent className="pt-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Em Avaliação</p>
                  <p className="text-2xl font-bold text-warning">
                    {
                      submissions.filter((s) => s.status === SubmissionStatus.UNDER_REVIEW)
                        .length
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">
                {userRole === UserRole.REVIEWER
                  ? 'Nenhuma submissão disponível para avaliação'
                  : 'Você ainda não possui submissões'}
              </p>
              {userRole === UserRole.PARTICIPANT && (
                <Button asChild variant="primary">
                  <Link href="/events">
                    Buscar Eventos
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              currentUserId={session.user.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              asChild
              variant={p === pagination.page ? 'primary' : 'outline'}
              size="sm"
            >
              <Link
                href={{
                  pathname: '/submissions',
                  query: { ...searchParams, page: p.toString() },
                }}
              >
                {p}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export default async function SubmissionsPage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userRole = (session.user as any).role

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {userRole === UserRole.REVIEWER
                ? 'Trabalhos para Avaliar'
                : 'Minhas Submissões'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {userRole === UserRole.REVIEWER
                ? 'Avalie trabalhos acadêmicos submetidos aos eventos'
                : 'Gerencie seus trabalhos acadêmicos submetidos'}
            </p>
          </div>

          {userRole === UserRole.PARTICIPANT && (
            <Button asChild variant="primary" size="lg">
              <Link href="/events">
                <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
                Nova Submissão
              </Link>
            </Button>
          )}
        </div>

        {/* Filters - TODO: Implement filter UI */}
        {/* <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
            Filtros
          </Button>
        </div> */}

        {/* Content */}
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-12">
              <Spinner />
            </div>
          }
        >
          <SubmissionsList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
