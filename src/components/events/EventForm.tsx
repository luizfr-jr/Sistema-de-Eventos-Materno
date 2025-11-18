'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { eventSchema } from '@/lib/validators'
import { EventType, EventStatus } from '@prisma/client'
import { ZodError } from 'zod'

interface EventFormProps {
  mode: 'create' | 'edit'
  eventId?: string
  initialData?: Partial<EventFormData>
}

interface EventFormData {
  title: string
  description: string
  shortDesc: string
  type: EventType
  status?: EventStatus
  startDate: string
  endDate: string
  location: string
  address: string
  city: string
  state: string
  isOnline: boolean
  meetingUrl: string
  capacity: number | null
  allowRegistrations: boolean
  registrationStart: string
  registrationEnd: string
  allowSubmissions: boolean
  submissionStart: string
  submissionEnd: string
  submissionGuidelines: string
  issueCertificates: boolean
  workload: number | null
  tags: string
  keywords: string
}

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

export function EventForm({ mode, eventId, initialData }: EventFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    shortDesc: initialData?.shortDesc || '',
    type: initialData?.type || 'SEMINAR',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    location: initialData?.location || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    isOnline: initialData?.isOnline || false,
    meetingUrl: initialData?.meetingUrl || '',
    capacity: initialData?.capacity || null,
    allowRegistrations: initialData?.allowRegistrations ?? true,
    registrationStart: initialData?.registrationStart || '',
    registrationEnd: initialData?.registrationEnd || '',
    allowSubmissions: initialData?.allowSubmissions ?? false,
    submissionStart: initialData?.submissionStart || '',
    submissionEnd: initialData?.submissionEnd || '',
    submissionGuidelines: initialData?.submissionGuidelines || '',
    issueCertificates: initialData?.issueCertificates ?? true,
    workload: initialData?.workload || null,
    tags: initialData?.tags || '',
    keywords: initialData?.keywords || '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : null }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      // Prepare data for validation
      const dataToValidate = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        keywords: formData.keywords ? formData.keywords.split(',').map((k) => k.trim()).filter(Boolean) : [],
        capacity: formData.capacity || undefined,
        workload: formData.workload || undefined,
        registrationStart: formData.registrationStart || undefined,
        registrationEnd: formData.registrationEnd || undefined,
        submissionStart: formData.submissionStart || undefined,
        submissionEnd: formData.submissionEnd || undefined,
      }

      // Validate with Zod
      eventSchema.parse(dataToValidate)

      // API call
      const url = mode === 'create' ? '/api/events' : `/api/events/${eventId}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToValidate),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          // Zod validation errors from API
          const fieldErrors: Record<string, string> = {}
          data.details.forEach((error: any) => {
            const field = error.path[0]
            fieldErrors[field] = error.message
          })
          setErrors(fieldErrors)
        }
        throw new Error(data.error || 'Erro ao salvar evento')
      }

      showToast.success(
        mode === 'create' ? 'Evento criado com sucesso!' : 'Evento atualizado com sucesso!'
      )

      router.push(`/events/${data.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error submitting form:', error)

      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const field = err.path[0] as string
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
        showToast.error('Verifique os campos do formulário')
      } else {
        showToast.error((error as Error).message || 'Erro ao salvar evento')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader divider>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Título do Evento"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
            placeholder="Ex: V Congresso Nacional de Educação"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="mb-2 block text-sm font-medium text-foreground">
                Tipo de Evento <span className="text-destructive">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ninma-purple focus-visible:ring-offset-2"
                required
              >
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1.5 text-sm text-destructive">{errors.type}</p>
              )}
            </div>

            <Input
              label="Carga Horária (horas)"
              name="workload"
              type="number"
              value={formData.workload || ''}
              onChange={handleChange}
              error={errors.workload}
              placeholder="Ex: 20"
              min="1"
            />
          </div>

          <div>
            <label htmlFor="shortDesc" className="mb-2 block text-sm font-medium text-foreground">
              Descrição Curta
            </label>
            <textarea
              id="shortDesc"
              name="shortDesc"
              value={formData.shortDesc}
              onChange={handleChange}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ninma-purple focus-visible:ring-offset-2"
              placeholder="Breve resumo do evento (será exibido nos cards)"
            />
            {errors.shortDesc && (
              <p className="mt-1.5 text-sm text-destructive">{errors.shortDesc}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground">
              Descrição Completa <span className="text-destructive">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ninma-purple focus-visible:ring-offset-2"
              placeholder="Descrição detalhada do evento, objetivos, público-alvo, etc."
              required
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tags (separadas por vírgula)"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              error={errors.tags}
              placeholder="Ex: educação, pesquisa, inovação"
            />

            <Input
              label="Palavras-chave (separadas por vírgula)"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              error={errors.keywords}
              placeholder="Ex: metodologia, ensino, aprendizagem"
            />
          </div>
        </CardContent>
      </Card>

      {/* Date and Time */}
      <Card>
        <CardHeader divider>
          <CardTitle>Data e Horário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data e Hora de Início"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              error={errors.startDate}
              required
            />

            <Input
              label="Data e Hora de Término"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
              error={errors.endDate}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader divider>
          <CardTitle>Local</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isOnline"
              name="isOnline"
              checked={formData.isOnline}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-ninma-purple focus:ring-ninma-purple"
            />
            <label htmlFor="isOnline" className="text-sm font-medium text-foreground">
              Evento Online
            </label>
          </div>

          {formData.isOnline && (
            <Input
              label="URL da Reunião"
              name="meetingUrl"
              type="url"
              value={formData.meetingUrl}
              onChange={handleChange}
              error={errors.meetingUrl}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
            />
          )}

          <Input
            label="Local"
            name="location"
            value={formData.location}
            onChange={handleChange}
            error={errors.location}
            required
            placeholder="Ex: Auditório Principal - Campus Central"
          />

          <Input
            label="Endereço"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            placeholder="Ex: Rua Exemplo, 123"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Cidade"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
              placeholder="Ex: São Paulo"
            />

            <Input
              label="Estado"
              name="state"
              value={formData.state}
              onChange={handleChange}
              error={errors.state}
              placeholder="Ex: SP"
              maxLength={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Registrations */}
      <Card>
        <CardHeader divider>
          <CardTitle>Inscrições</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allowRegistrations"
              name="allowRegistrations"
              checked={formData.allowRegistrations}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-ninma-purple focus:ring-ninma-purple"
            />
            <label htmlFor="allowRegistrations" className="text-sm font-medium text-foreground">
              Permitir Inscrições
            </label>
          </div>

          {formData.allowRegistrations && (
            <>
              <Input
                label="Capacidade Máxima"
                name="capacity"
                type="number"
                value={formData.capacity || ''}
                onChange={handleChange}
                error={errors.capacity}
                placeholder="Deixe em branco para capacidade ilimitada"
                min="1"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Início das Inscrições"
                  name="registrationStart"
                  type="datetime-local"
                  value={formData.registrationStart}
                  onChange={handleChange}
                  error={errors.registrationStart}
                />

                <Input
                  label="Fim das Inscrições"
                  name="registrationEnd"
                  type="datetime-local"
                  value={formData.registrationEnd}
                  onChange={handleChange}
                  error={errors.registrationEnd}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Submissions */}
      <Card>
        <CardHeader divider>
          <CardTitle>Trabalhos Acadêmicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allowSubmissions"
              name="allowSubmissions"
              checked={formData.allowSubmissions}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-ninma-purple focus:ring-ninma-purple"
            />
            <label htmlFor="allowSubmissions" className="text-sm font-medium text-foreground">
              Aceitar Trabalhos Acadêmicos
            </label>
          </div>

          {formData.allowSubmissions && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Início das Submissões"
                  name="submissionStart"
                  type="datetime-local"
                  value={formData.submissionStart}
                  onChange={handleChange}
                  error={errors.submissionStart}
                />

                <Input
                  label="Fim das Submissões"
                  name="submissionEnd"
                  type="datetime-local"
                  value={formData.submissionEnd}
                  onChange={handleChange}
                  error={errors.submissionEnd}
                />
              </div>

              <div>
                <label htmlFor="submissionGuidelines" className="mb-2 block text-sm font-medium text-foreground">
                  Diretrizes para Submissão
                </label>
                <textarea
                  id="submissionGuidelines"
                  name="submissionGuidelines"
                  value={formData.submissionGuidelines}
                  onChange={handleChange}
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ninma-purple focus-visible:ring-offset-2"
                  placeholder="Instruções e requisitos para submissão de trabalhos"
                />
                {errors.submissionGuidelines && (
                  <p className="mt-1.5 text-sm text-destructive">{errors.submissionGuidelines}</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Certificates */}
      <Card>
        <CardHeader divider>
          <CardTitle>Certificados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="issueCertificates"
              name="issueCertificates"
              checked={formData.issueCertificates}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-ninma-purple focus:ring-ninma-purple"
            />
            <label htmlFor="issueCertificates" className="text-sm font-medium text-foreground">
              Emitir Certificados
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {mode === 'create' ? 'Criar Evento' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
