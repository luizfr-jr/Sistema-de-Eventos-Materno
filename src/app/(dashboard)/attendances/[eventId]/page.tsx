'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { AttendanceStats } from '@/components/attendances/AttendanceStats'
import { AttendanceTable } from '@/components/attendances/AttendanceTable'
import { CheckinForm } from '@/components/attendances/CheckinForm'
import { QRCodeGenerator } from '@/components/attendances/QRCodeGenerator'
import toast from 'react-hot-toast'

interface PageProps {
  params: {
    eventId: string
  }
}

export default function EventAttendancePage({ params }: PageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [attendances, setAttendances] = useState<any[]>([])

  const loadData = async () => {
    try {
      // Load event details
      const eventRes = await fetch(`/api/events/${params.eventId}`)
      if (!eventRes.ok) throw new Error('Evento não encontrado')
      const eventData = await eventRes.json()
      setEvent(eventData)

      // Load attendance stats
      const statsRes = await fetch(`/api/events/${params.eventId}/attendances/stats`)
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // Load attendances
      const attendancesRes = await fetch(
        `/api/events/${params.eventId}/attendances`
      )
      if (attendancesRes.ok) {
        const attendancesData = await attendancesRes.json()
        setAttendances(attendancesData.attendances || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [params.eventId])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await fetch(
        `/api/events/${params.eventId}/attendances/export`
      )

      if (!response.ok) {
        throw new Error('Erro ao exportar dados')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `presencas-${event?.title.replace(/\s+/g, '-').toLowerCase()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Lista exportada com sucesso')
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Erro ao exportar lista')
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async (registrationId: string) => {
    try {
      const response = await fetch(
        `/api/attendances/${registrationId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao remover check-in')
      }

      toast.success('Check-in removido com sucesso')
      handleRefresh()
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Erro ao remover check-in')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Evento não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/attendances">Voltar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/attendances" aria-label="Voltar">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Voltar
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {event.title}
            </h1>
            <p className="text-muted-foreground">
              Controle de presenças do evento
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Exportar CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mb-8">
          <AttendanceStats stats={stats} />
        </div>
      )}

      {/* Check-in Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CheckinForm eventId={params.eventId} onCheckin={handleRefresh} />
        <QRCodeGenerator eventId={params.eventId} />
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader divider>
          <CardTitle>Lista de Presenças</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6">
            <AttendanceTable
              attendances={attendances}
              canManage={true}
              onDelete={handleDelete}
              onExport={handleExport}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
