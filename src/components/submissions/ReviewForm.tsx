'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ReviewStatus } from '@prisma/client'

interface ReviewFormProps {
  submissionId: string
  onSuccess?: () => void
}

export function ReviewForm({ submissionId, onSuccess }: ReviewFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    status: ReviewStatus.PENDING,
    originality: 0,
    relevance: 0,
    methodology: 0,
    clarity: 0,
    comments: '',
  })

  const criteriaLabels = {
    originality: 'Originalidade',
    relevance: 'Relevância',
    methodology: 'Metodologia',
    clarity: 'Clareza',
  }

  const handleRatingChange = (
    criterion: 'originality' | 'relevance' | 'methodology' | 'clarity',
    rating: number
  ) => {
    setFormData((prev) => ({ ...prev, [criterion]: rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate
    if (formData.comments.length < 20) {
      setError('Os comentários devem ter no mínimo 20 caracteres')
      return
    }

    if (
      formData.originality === 0 ||
      formData.relevance === 0 ||
      formData.methodology === 0 ||
      formData.clarity === 0
    ) {
      setError('Por favor, avalie todos os critérios')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/submissions/${submissionId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao enviar avaliação')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/submissions')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar avaliação')
    } finally {
      setIsLoading(false)
    }
  }

  const RatingInput = ({
    label,
    value,
    onChange,
  }: {
    label: string
    value: number
    onChange: (rating: number) => void
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}
        <span className="text-destructive ml-1" aria-label="obrigatório">
          *
        </span>
      </label>
      <div className="flex items-center gap-2" role="group" aria-label={`Avaliação de ${label}`}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`
              p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ninma-purple focus:ring-offset-2
              ${value >= rating ? 'text-ninma-orange' : 'text-muted-foreground'}
              hover:text-ninma-orange
            `}
            aria-label={`${rating} ${rating === 1 ? 'estrela' : 'estrelas'}`}
            aria-pressed={value >= rating}
          >
            <Star
              className="w-6 h-6"
              fill={value >= rating ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {value > 0 ? `${value}/5` : 'Não avaliado'}
        </span>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card variant="bordered">
        <CardHeader>
          <CardTitle as="h3">Critérios de Avaliação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(Object.keys(criteriaLabels) as Array<keyof typeof criteriaLabels>).map(
            (criterion) => (
              <RatingInput
                key={criterion}
                label={criteriaLabels[criterion]}
                value={formData[criterion]}
                onChange={(rating) => handleRatingChange(criterion, rating)}
              />
            )
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <label htmlFor="review-status" className="text-sm font-medium text-foreground">
          Decisão
          <span className="text-destructive ml-1" aria-label="obrigatório">
            *
          </span>
        </label>
        <select
          id="review-status"
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              status: e.target.value as ReviewStatus,
            }))
          }
          className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ninma-purple focus:border-transparent"
          required
          aria-required="true"
        >
          <option value={ReviewStatus.PENDING}>Pendente</option>
          <option value={ReviewStatus.APPROVED}>Aprovar</option>
          <option value={ReviewStatus.REJECTED}>Rejeitar</option>
          <option value={ReviewStatus.REVISION}>Solicitar Revisão</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="review-comments" className="text-sm font-medium text-foreground">
          Comentários
          <span className="text-destructive ml-1" aria-label="obrigatório">
            *
          </span>
        </label>
        <textarea
          id="review-comments"
          value={formData.comments}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, comments: e.target.value }))
          }
          rows={6}
          className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ninma-purple focus:border-transparent resize-none"
          placeholder="Forneça feedback detalhado sobre o trabalho..."
          required
          aria-required="true"
          minLength={20}
          aria-describedby="comments-help"
        />
        <p id="comments-help" className="text-xs text-muted-foreground">
          Mínimo de 20 caracteres. {formData.comments.length} caracteres digitados.
        </p>
      </div>

      {error && (
        <div
          className="p-4 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
          Enviar Avaliação
        </Button>
      </div>
    </form>
  )
}
