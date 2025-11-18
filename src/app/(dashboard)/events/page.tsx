import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, Calendar } from 'lucide-react'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { EventCard } from '@/components/events/EventCard'
import { EventFilters } from '@/components/events/EventFilters'
import { UserRole } from '@prisma/client'

interface PageProps {
  searchParams: {
    page?: string
    search?: string
    status?: string
    type?: string
    isOnline?: string
  }
}

async function EventsList({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || '1')
  const params = new URLSearchParams()

  if (searchParams.search) params.set('search', searchParams.search)
  if (searchParams.status) params.set('status', searchParams.status)
  if (searchParams.type) params.set('type', searchParams.type)
  if (searchParams.isOnline) params.set('isOnline', searchParams.isOnline)
  params.set('page', page.toString())
  params.set('limit', '12')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/events?${params.toString()}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch events')
  }

  const data = await response.json()
  const { events, pagination } = data

  return (
    <>
      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="w-16 h-16 text-muted-foreground mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold mb-2">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchParams.search || searchParams.status || searchParams.type
                ? 'Tente ajustar os filtros para encontrar eventos.'
                : 'Ainda não há eventos cadastrados no sistema.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                asChild
              >
                <Link
                  href={`?${new URLSearchParams({ ...searchParams, page: String(pagination.page - 1) }).toString()}`}
                  aria-label="Página anterior"
                >
                  Anterior
                </Link>
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((pageNum) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      Math.abs(pageNum - pagination.page) <= 1
                    )
                  })
                  .map((pageNum, index, array) => {
                    // Add ellipsis
                    const prevPageNum = array[index - 1]
                    const showEllipsis = prevPageNum && pageNum - prevPageNum > 1

                    return (
                      <div key={pageNum} className="flex items-center gap-2">
                        {showEllipsis && (
                          <span className="text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={pageNum === pagination.page ? 'primary' : 'outline'}
                          size="sm"
                          asChild
                        >
                          <Link
                            href={`?${new URLSearchParams({ ...searchParams, page: String(pageNum) }).toString()}`}
                            aria-label={`Página ${pageNum}`}
                            aria-current={pageNum === pagination.page ? 'page' : undefined}
                          >
                            {pageNum}
                          </Link>
                        </Button>
                      </div>
                    )
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                asChild
              >
                <Link
                  href={`?${new URLSearchParams({ ...searchParams, page: String(pagination.page + 1) }).toString()}`}
                  aria-label="Próxima página"
                >
                  Próxima
                </Link>
              </Button>
            </div>
          )}

          {/* Results summary */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} eventos
          </p>
        </>
      )}
    </>
  )
}

export default async function EventsPage({ searchParams }: PageProps) {
  const session = await auth()
  const userRole = (session?.user as any)?.role

  const canCreateEvents =
    userRole === UserRole.ADMIN || userRole === UserRole.COORDINATOR

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Eventos
          </h1>
          <p className="text-muted-foreground">
            Explore e inscreva-se em eventos acadêmicos
          </p>
        </div>

        {canCreateEvents && (
          <Button variant="primary" size="lg" asChild>
            <Link href="/events/new" aria-label="Criar novo evento">
              <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
              Novo Evento
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-8">
        <EventFilters />
      </div>

      {/* Events List */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" showLabel label="Carregando eventos..." />
          </div>
        }
      >
        <EventsList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Eventos | ninma hub',
  description: 'Explore e inscreva-se em eventos acadêmicos',
}
