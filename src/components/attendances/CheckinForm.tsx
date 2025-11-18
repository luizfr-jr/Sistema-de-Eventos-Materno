'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Search, UserCheck, UserX, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface Registration {
  id: string
  status: string
  user: {
    id: string
    name: string
    email: string
    image?: string | null
    institution?: string | null
  }
  attendance?: {
    id: string
    checkinAt: Date
  } | null
}

interface CheckinFormProps {
  eventId: string
  onCheckin?: () => void
}

export function CheckinForm({ eventId, onCheckin }: CheckinFormProps) {
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<Registration[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [checking, setChecking] = useState(false)

  const handleSearch = async () => {
    if (!search.trim()) {
      toast.error('Digite um nome ou email para buscar')
      return
    }

    setSearching(true)
    try {
      const response = await fetch(
        `/api/events/${eventId}/registrations?search=${encodeURIComponent(search)}&status=CONFIRMED`
      )

      if (!response.ok) {
        throw new Error('Erro ao buscar participantes')
      }

      const data = await response.json()
      setResults(data.registrations || [])

      if (data.registrations.length === 0) {
        toast.error('Nenhum participante encontrado')
      }
    } catch (error) {
      console.error('Error searching:', error)
      toast.error('Erro ao buscar participantes')
    } finally {
      setSearching(false)
    }
  }

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    const availableIds = results
      .filter((r) => !r.attendance)
      .map((r) => r.id)

    if (selectedIds.size === availableIds.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(availableIds))
    }
  }

  const handleCheckin = async () => {
    if (selectedIds.size === 0) {
      toast.error('Selecione pelo menos um participante')
      return
    }

    setChecking(true)
    try {
      const response = await fetch('/api/attendances/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          registrationIds: Array.from(selectedIds),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar presenças')
      }

      toast.success(data.message || 'Check-in realizado com sucesso')
      setSelectedIds(new Set())
      setSearch('')
      setResults([])
      onCheckin?.()
    } catch (error) {
      console.error('Error checking in:', error)
      toast.error(
        error instanceof Error ? error.message : 'Erro ao registrar presenças'
      )
    } finally {
      setChecking(false)
    }
  }

  const availableCount = results.filter((r) => !r.attendance).length

  return (
    <Card>
      <CardHeader divider>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" aria-hidden="true" />
          Check-in Rápido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Nome ou email do participante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              disabled={searching}
              aria-label="Buscar participante"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching || !search.trim()}
            aria-label="Buscar"
          >
            {searching ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Search className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {results.length} resultado(s) encontrado(s)
              </p>
              {availableCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedIds.size === availableCount
                    ? 'Desmarcar Todos'
                    : 'Selecionar Todos'}
                </Button>
              )}
            </div>

            <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
              {results.map((registration) => {
                const isCheckedIn = !!registration.attendance
                const isSelected = selectedIds.has(registration.id)

                return (
                  <div
                    key={registration.id}
                    className={`p-3 flex items-center gap-3 ${
                      isCheckedIn
                        ? 'bg-muted/30 opacity-60'
                        : 'hover:bg-muted/50 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isCheckedIn) {
                        handleToggleSelect(registration.id)
                      }
                    }}
                  >
                    {!isCheckedIn && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(registration.id)}
                        className="h-4 w-4 rounded border-gray-300 text-ninma-purple focus:ring-ninma-purple"
                        aria-label={`Selecionar ${registration.user.name}`}
                      />
                    )}

                    {registration.user.image ? (
                      <img
                        src={registration.user.image}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-ninma-purple/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-ninma-purple">
                          {registration.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {registration.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {registration.user.email}
                      </p>
                      {registration.user.institution && (
                        <p className="text-xs text-muted-foreground truncate">
                          {registration.user.institution}
                        </p>
                      )}
                    </div>

                    {isCheckedIn ? (
                      <Badge variant="success" size="sm">
                        <UserCheck className="h-3 w-3 mr-1" aria-hidden="true" />
                        Presente
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm">
                        <UserX className="h-3 w-3 mr-1" aria-hidden="true" />
                        Ausente
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>

            {selectedIds.size > 0 && (
              <Button
                onClick={handleCheckin}
                disabled={checking}
                className="w-full"
              >
                {checking ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" aria-hidden="true" />
                    Confirmar Check-in ({selectedIds.size})
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
