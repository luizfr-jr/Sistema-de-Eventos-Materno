'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { EventStatus, EventType } from '@prisma/client'

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: 'CONFERENCE', label: 'Conferência' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'SEMINAR', label: 'Seminário' },
  { value: 'COURSE', label: 'Curso' },
  { value: 'WEBINAR', label: 'Webinar' },
  { value: 'SYMPOSIUM', label: 'Simpósio' },
  { value: 'CONGRESS', label: 'Congresso' },
  { value: 'OTHER', label: 'Outro' },
]

const EVENT_STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'OPEN', label: 'Aberto' },
  { value: 'CLOSED', label: 'Encerrado' },
  { value: 'IN_PROGRESS', label: 'Em Andamento' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

interface EventFiltersProps {
  showStatusFilter?: boolean
  showTypeFilter?: boolean
  showSearchFilter?: boolean
  showOnlineFilter?: boolean
}

export function EventFilters({
  showStatusFilter = true,
  showTypeFilter = true,
  showSearchFilter = true,
  showOnlineFilter = true,
}: EventFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isExpanded, setIsExpanded] = useState(false)

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    type: searchParams.get('type') || '',
    isOnline: searchParams.get('isOnline') || '',
  })

  const [tempSearch, setTempSearch] = useState(filters.search)

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams()

    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.status) params.set('status', newFilters.status)
    if (newFilters.type) params.set('type', newFilters.type)
    if (newFilters.isOnline) params.set('isOnline', newFilters.isOnline)

    // Reset to page 1 when filters change
    params.set('page', '1')

    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : window.location.pathname)
  }

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleFilterChange('search', tempSearch)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: '',
      type: '',
      isOnline: '',
    }
    setFilters(clearedFilters)
    setTempSearch('')
    updateURL(clearedFilters)
  }

  const removeFilter = (key: keyof typeof filters) => {
    const newFilters = { ...filters, [key]: '' }
    if (key === 'search') {
      setTempSearch('')
    }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {showSearchFilter && (
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar eventos..."
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              aria-label="Buscar eventos"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            aria-label="Aplicar busca"
          >
            Buscar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Ocultar filtros' : 'Mostrar filtros'}
            aria-expanded={isExpanded}
          >
            <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="purple" size="sm" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </form>
      )}

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          {filters.search && (
            <Badge variant="purple-outline" className="gap-1">
              Busca: {filters.search}
              <button
                onClick={() => removeFilter('search')}
                className="ml-1 hover:text-destructive"
                aria-label="Remover filtro de busca"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </Badge>
          )}
          {filters.status && (
            <Badge variant="purple-outline" className="gap-1">
              Status: {EVENT_STATUS_OPTIONS.find((o) => o.value === filters.status)?.label}
              <button
                onClick={() => removeFilter('status')}
                className="ml-1 hover:text-destructive"
                aria-label="Remover filtro de status"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </Badge>
          )}
          {filters.type && (
            <Badge variant="purple-outline" className="gap-1">
              Tipo: {EVENT_TYPE_OPTIONS.find((o) => o.value === filters.type)?.label}
              <button
                onClick={() => removeFilter('type')}
                className="ml-1 hover:text-destructive"
                aria-label="Remover filtro de tipo"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </Badge>
          )}
          {filters.isOnline && (
            <Badge variant="purple-outline" className="gap-1">
              {filters.isOnline === 'true' ? 'Online' : 'Presencial'}
              <button
                onClick={() => removeFilter('isOnline')}
                className="ml-1 hover:text-destructive"
                aria-label="Remover filtro de modalidade"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            aria-label="Limpar todos os filtros"
          >
            Limpar tudo
          </Button>
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showStatusFilter && (
                <div>
                  <label
                    htmlFor="status-filter"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Status
                  </label>
                  <select
                    id="status-filter"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ninma-purple focus-visible:ring-offset-2"
                    aria-label="Filtrar por status"
                  >
                    <option value="">Todos os status</option>
                    {EVENT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showTypeFilter && (
                <div>
                  <label
                    htmlFor="type-filter"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Tipo
                  </label>
                  <select
                    id="type-filter"
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ninma-purple focus-visible:ring-offset-2"
                    aria-label="Filtrar por tipo"
                  >
                    <option value="">Todos os tipos</option>
                    {EVENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showOnlineFilter && (
                <div>
                  <label
                    htmlFor="online-filter"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Modalidade
                  </label>
                  <select
                    id="online-filter"
                    value={filters.isOnline}
                    onChange={(e) => handleFilterChange('isOnline', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ninma-purple focus-visible:ring-offset-2"
                    aria-label="Filtrar por modalidade"
                  >
                    <option value="">Todas as modalidades</option>
                    <option value="true">Online</option>
                    <option value="false">Presencial</option>
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
