'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Search,
  UserCheck,
  UserX,
  QrCode,
  Hand,
  Laptop,
  Download,
  Trash2,
  Clock,
  MapPin,
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { AttendanceMethod } from '@prisma/client'
import toast from 'react-hot-toast'

interface Attendance {
  id: string
  checkinAt: Date
  checkoutAt?: Date | null
  method: AttendanceMethod
  location?: string | null
  ipAddress?: string | null
  registration: {
    id: string
    user: {
      id: string
      name: string
      email: string
      image?: string | null
      institution?: string | null
      course?: string | null
    }
  }
}

interface AttendanceTableProps {
  attendances: Attendance[]
  canManage?: boolean
  onDelete?: (registrationId: string) => void
  onExport?: () => void
}

const METHOD_LABELS = {
  QR_CODE: 'QR Code',
  MANUAL: 'Manual',
  AUTOMATIC: 'Automático',
}

const METHOD_ICONS = {
  QR_CODE: QrCode,
  MANUAL: Hand,
  AUTOMATIC: Laptop,
}

const METHOD_VARIANTS = {
  QR_CODE: 'teal' as const,
  MANUAL: 'orange' as const,
  AUTOMATIC: 'purple' as const,
}

export function AttendanceTable({
  attendances,
  canManage = false,
  onDelete,
  onExport,
}: AttendanceTableProps) {
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filteredAttendances = attendances.filter((attendance) => {
    const searchLower = search.toLowerCase()
    return (
      attendance.registration.user.name.toLowerCase().includes(searchLower) ||
      attendance.registration.user.email.toLowerCase().includes(searchLower) ||
      attendance.registration.user.institution?.toLowerCase().includes(searchLower)
    )
  })

  const handleDelete = async (registrationId: string) => {
    if (!onDelete) return

    if (!confirm('Tem certeza que deseja remover este check-in?')) {
      return
    }

    setDeleting(registrationId)
    try {
      await onDelete(registrationId)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Buscar por nome, email ou instituição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            aria-label="Buscar participante"
          />
        </div>

        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Participante
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Instituição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Check-out
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Método
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Local
                </th>
                {canManage && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredAttendances.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 7 : 6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {search
                      ? 'Nenhum participante encontrado'
                      : 'Nenhuma presença registrada'}
                  </td>
                </tr>
              ) : (
                filteredAttendances.map((attendance) => {
                  const MethodIcon = METHOD_ICONS[attendance.method]
                  return (
                    <tr
                      key={attendance.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {attendance.registration.user.image ? (
                            <img
                              src={attendance.registration.user.image}
                              alt=""
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-ninma-purple/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-ninma-purple">
                                {attendance.registration.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {attendance.registration.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {attendance.registration.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm text-foreground">
                            {attendance.registration.user.institution || '-'}
                          </p>
                          {attendance.registration.user.course && (
                            <p className="text-xs text-muted-foreground">
                              {attendance.registration.user.course}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock
                            className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"
                            aria-hidden="true"
                          />
                          <div>
                            <p className="text-sm text-foreground">
                              {formatTime(attendance.checkinAt)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(attendance.checkinAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {attendance.checkoutAt ? (
                          <div className="flex items-center gap-1.5">
                            <Clock
                              className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"
                              aria-hidden="true"
                            />
                            <div>
                              <p className="text-sm text-foreground">
                                {formatTime(attendance.checkoutAt)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(attendance.checkoutAt)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant={METHOD_VARIANTS[attendance.method]} size="sm">
                          <MethodIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                          {METHOD_LABELS[attendance.method]}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        {attendance.location ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin
                              className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"
                              aria-hidden="true"
                            />
                            <span className="text-sm text-foreground">
                              {attendance.location}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(attendance.registration.id)}
                            disabled={deleting === attendance.registration.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Remover check-in</span>
                          </Button>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      {filteredAttendances.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Mostrando {filteredAttendances.length} de {attendances.length} presença(s)
        </p>
      )}
    </div>
  )
}
