import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, FileText, Award, Users } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()

  // Buscar estatísticas
  const [eventsCount, submissionsCount, certificatesCount, usersCount] = await Promise.all([
    prisma.event.count({
      where: session?.user.role === 'ADMIN'
        ? {}
        : { createdById: session?.user.id }
    }),
    prisma.submission.count({
      where: session?.user.role === 'ADMIN'
        ? {}
        : { userId: session?.user.id }
    }),
    prisma.certificate.count({
      where: session?.user.role === 'ADMIN'
        ? {}
        : { userId: session?.user.id }
    }),
    session?.user.role === 'ADMIN'
      ? prisma.user.count()
      : Promise.resolve(0),
  ])

  // Buscar eventos recentes
  const recentEvents = await prisma.event.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    where: session?.user.role === 'ADMIN'
      ? {}
      : { createdById: session?.user.id },
    select: {
      id: true,
      title: true,
      startDate: true,
      status: true,
      type: true,
    },
  })

  const stats = [
    {
      title: 'Eventos',
      value: eventsCount,
      icon: Calendar,
      color: 'text-ninma-purple',
      bgColor: 'bg-ninma-purple/10',
    },
    {
      title: 'Trabalhos',
      value: submissionsCount,
      icon: FileText,
      color: 'text-ninma-orange',
      bgColor: 'bg-ninma-orange/10',
    },
    {
      title: 'Certificados',
      value: certificatesCount,
      icon: Award,
      color: 'text-ninma-teal',
      bgColor: 'bg-ninma-teal/10',
    },
    ...(session?.user.role === 'ADMIN'
      ? [
          {
            title: 'Usuários',
            value: usersCount,
            icon: Users,
            color: 'text-ninma-pink',
            bgColor: 'bg-ninma-pink/10',
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo, {session?.user.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Aqui está um resumo das suas atividades
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-full p-3 ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              Nenhum evento encontrado
            </p>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {event.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(event.startDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="purple">{event.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
