'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FileUpload } from './FileUpload'
import { SubmissionStatus } from '@prisma/client'

interface Author {
  name: string
  email: string
  institution?: string
}

interface SubmissionFormProps {
  eventId: string
  submission?: any
  mode?: 'create' | 'edit'
  onSuccess?: () => void
}

export function SubmissionForm({
  eventId,
  submission,
  mode = 'create',
  onSuccess,
}: SubmissionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: submission?.title || '',
    abstract: submission?.abstract || '',
    keywords: submission?.keywords || [],
    authors: submission?.authors || [],
    fileUrl: submission?.fileUrl || '',
    fileName: submission?.fileName || '',
    fileSize: submission?.fileSize || 0,
    mimeType: submission?.mimeType || '',
    status: submission?.status || SubmissionStatus.SUBMITTED,
  })

  const [newKeyword, setNewKeyword] = useState('')
  const [newAuthor, setNewAuthor] = useState<Author>({
    name: '',
    email: '',
    institution: '',
  })

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()],
      }))
      setNewKeyword('')
    }
  }

  const handleRemoveKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_keyword: string, i: number) => i !== index),
    }))
  }

  const handleAddAuthor = () => {
    if (newAuthor.name.trim() && newAuthor.email.trim()) {
      setFormData((prev) => ({
        ...prev,
        authors: [...prev.authors, { ...newAuthor }],
      }))
      setNewAuthor({ name: '', email: '', institution: '' })
    }
  }

  const handleRemoveAuthor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      authors: prev.authors.filter((_author: Author, i: number) => i !== index),
    }))
  }

  const handleFileSelect = (file: {
    fileUrl: string
    fileName: string
    fileSize: number
    mimeType: string
  }) => {
    setFormData((prev) => ({
      ...prev,
      fileUrl: file.fileUrl,
      fileName: file.fileName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
    }))
  }

  const handleFileRemove = () => {
    setFormData((prev) => ({
      ...prev,
      fileUrl: '',
      fileName: '',
      fileSize: 0,
      mimeType: '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault()
    setError(null)

    // Validate
    if (formData.title.length < 10) {
      setError('O título deve ter no mínimo 10 caracteres')
      return
    }

    if (formData.abstract.length < 50) {
      setError('O resumo deve ter no mínimo 50 caracteres')
      return
    }

    if (formData.keywords.length < 3) {
      setError('Adicione pelo menos 3 palavras-chave')
      return
    }

    if (formData.authors.length === 0) {
      setError('Adicione pelo menos um autor')
      return
    }

    if (!formData.fileUrl && !isDraft) {
      setError('É necessário enviar um arquivo')
      return
    }

    setIsLoading(true)

    try {
      const submitData = {
        ...formData,
        eventId,
        status: isDraft ? SubmissionStatus.DRAFT : SubmissionStatus.SUBMITTED,
      }

      const url =
        mode === 'edit'
          ? `/api/submissions/${submission.id}`
          : '/api/submissions'

      const method = mode === 'edit' ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao salvar submissão')
      }

      const result = await response.json()

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/submissions/${result.id}`)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar submissão')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="submission-title" className="text-sm font-medium text-foreground">
          Título do Trabalho
          <span className="text-destructive ml-1" aria-label="obrigatório">
            *
          </span>
        </label>
        <Input
          id="submission-title"
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Digite o título do trabalho acadêmico"
          required
          minLength={10}
          aria-required="true"
        />
        <p className="text-xs text-muted-foreground">
          Mínimo de 10 caracteres. {formData.title.length} caracteres digitados.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="submission-abstract" className="text-sm font-medium text-foreground">
          Resumo
          <span className="text-destructive ml-1" aria-label="obrigatório">
            *
          </span>
        </label>
        <textarea
          id="submission-abstract"
          value={formData.abstract}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, abstract: e.target.value }))
          }
          rows={6}
          className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ninma-purple focus:border-transparent resize-none"
          placeholder="Digite o resumo do trabalho"
          required
          minLength={50}
          aria-required="true"
        />
        <p className="text-xs text-muted-foreground">
          Mínimo de 50 caracteres. {formData.abstract.length} caracteres digitados.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Palavras-chave
          <span className="text-destructive ml-1" aria-label="obrigatório">
            *
          </span>
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddKeyword()
              }
            }}
            placeholder="Digite uma palavra-chave"
            aria-label="Nova palavra-chave"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddKeyword}
            disabled={!newKeyword.trim()}
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Adicionar
          </Button>
        </div>
        {formData.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.keywords.map((keyword: string, index: number) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-ninma-purple/10 text-ninma-purple text-sm"
              >
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(index)}
                  className="hover:text-destructive transition-colors"
                  aria-label={`Remover palavra-chave ${keyword}`}
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Adicione pelo menos 3 palavras-chave. {formData.keywords.length} adicionadas.
        </p>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-foreground">
          Autores
          <span className="text-destructive ml-1" aria-label="obrigatório">
            *
          </span>
        </label>

        <div className="grid gap-3 md:grid-cols-3">
          <Input
            type="text"
            value={newAuthor.name}
            onChange={(e) =>
              setNewAuthor((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Nome do autor"
            aria-label="Nome do autor"
          />
          <Input
            type="email"
            value={newAuthor.email}
            onChange={(e) =>
              setNewAuthor((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Email do autor"
            aria-label="Email do autor"
          />
          <Input
            type="text"
            value={newAuthor.institution || ''}
            onChange={(e) =>
              setNewAuthor((prev) => ({ ...prev, institution: e.target.value }))
            }
            placeholder="Instituição (opcional)"
            aria-label="Instituição do autor"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleAddAuthor}
          disabled={!newAuthor.name.trim() || !newAuthor.email.trim()}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Adicionar Autor
        </Button>

        {formData.authors.length > 0 && (
          <div className="space-y-2">
            {formData.authors.map((author: Author, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-md border border-border bg-card"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{author.name}</p>
                  <p className="text-xs text-muted-foreground">{author.email}</p>
                  {author.institution && (
                    <p className="text-xs text-muted-foreground">{author.institution}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAuthor(index)}
                  aria-label={`Remover autor ${author.name}`}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Pelo menos 1 autor é obrigatório. {formData.authors.length} adicionados.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Arquivo do Trabalho
          <span className="text-destructive ml-1" aria-label="obrigatório">
            *
          </span>
        </label>
        <FileUpload
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          currentFile={
            formData.fileUrl
              ? {
                  fileName: formData.fileName,
                  fileSize: formData.fileSize,
                  fileUrl: formData.fileUrl,
                }
              : null
          }
          disabled={isLoading}
        />
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
        <Button
          type="button"
          variant="ghost"
          onClick={(e) => handleSubmit(e, true)}
          disabled={isLoading}
        >
          Salvar Rascunho
        </Button>
        <Button
          type="submit"
          variant="primary"
          onClick={(e) => handleSubmit(e, false)}
          isLoading={isLoading}
          className="flex-1"
        >
          {mode === 'edit' ? 'Atualizar Submissão' : 'Enviar Trabalho'}
        </Button>
      </div>
    </form>
  )
}
