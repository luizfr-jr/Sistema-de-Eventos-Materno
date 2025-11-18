import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, QrCode, Users, ArrowRight } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

/**
 * Attendance Control Panel
 * Lists all events with attendance management options
 * Only accessible to ADMIN and COORDINATOR
 */
export default async function AttendancesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userRole = (session.user as any).role

  if (userRole !== UserRole.ADMIN && userRole !== UserRole.COORDINATOR) {
    redirect('/dashboard')
  }

  // Get events where user can manage attendances
  const where =
    userRole === UserRole.ADMIN
      ? {} // Admin can manage all events
      : { createdById: session.user.id } // Coordinator only their events

  const events = await prisma.event.findMany({
    where,
    include: {
      _count: {
        select: {
          registrations: {
            where: {
              status: 'CONFIRMED',
            },
          },
        },
      },
    },
    orderBy: {
      startDate: 'desc',
    },
    take: 50,
  })

  // Get attendance stats for each event
  const eventsWithStats = await Promise.all(
    events.map(async (event) => {
      const attendanceCount = await prisma.attendance.count({
        where: {
          registration: {
            eventId: event.id,
          },
        },
      })

      const confirmedCount = event._count.registrations
      const percentage =
        confirmedCount > 0
          ? Math.round((attendanceCount / confirmedCount) * 100)
          : 0

      return {
        ...event,
        attendanceCount,
        percentage,
      }
    })
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Controle de Presenças
            </h1>
            <p className="text-muted-foreground">
              Gerencie as presenças dos participantes nos eventos
            </p>
          </div>
          <Button asChild>
            <Link href="/attendances/qr-scan">
              <QrCode className="h-4 w-4 mr-2" aria-hidden="true" />
              Scanner QR Code
            </Link>
          </Button>
        </div>
      </div>

      {/* Events List */}
      {eventsWithStats.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users
              className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20"
              aria-hidden="true"
            />
            <p className="text-muted-foreground mb-4">
              Nenhum evento encontrado
            </p>
            <Button asChild>
              <Link href="/events/new">Criar Evento</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {eventsWithStats.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader divider>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="mb-2 line-clamp-2">
                      {event.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      <time dateTime={event.startDate.toISOString()}>
                        {formatDate(event.startDate)}
                      </time>
                    </div>
                  </div>
                  <Badge
                    variant={
                      event.percentage >= 80
                        ? 'success'
                        : event.percentage >= 50
                        ? 'warning'
                        : 'destructive'
                    }
                  >
                    {event.percentage}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">
                      {event._count.registrations}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Inscritos
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {event.attendanceCount}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Presentes
                    </p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {event._count.registrations - event.attendanceCount}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ausentes
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      Taxa de Presença
                    </span>
                    <span className="font-semibold text-foreground">
                      {event.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-ninma-purple h-full transition-all"
                      style={{ width: `${event.percentage}%` }}
                      role="progressbar"
                      aria-valuenow={event.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Taxa de presença"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    asChild
                    className="flex-1"
                  >
                    <Link href={`/attendances/${event.id}`}>
                      <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                      Gerenciar
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/events/${event.id}`}>
                      Ver Evento
                      <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export const metadata = {
  title: 'Controle de Presenças | ninma hub',
  description: 'Gerencie as presenças dos participantes nos eventos',
}
