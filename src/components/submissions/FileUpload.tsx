'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatFileSize } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: {
    fileUrl: string
    fileName: string
    fileSize: number
    mimeType: string
  }) => void
  onFileRemove?: () => void
  currentFile?: {
    fileName: string
    fileSize: number
    fileUrl: string
  } | null
  disabled?: boolean
  error?: string
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  currentFile,
  disabled = false,
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  const maxSize = 10 * 1024 * 1024 // 10MB

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return 'Tipo de arquivo inválido. Permitidos: PDF, DOC, DOCX'
    }

    if (file.size > maxSize) {
      return 'Arquivo muito grande. Tamanho máximo: 10MB'
    }

    return null
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/submissions/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao fazer upload')
      }

      const data = await response.json()
      onFileSelect(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao fazer upload do arquivo'
      setUploadError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setUploadError(validationError)
        return
      }

      await uploadFile(file)
    },
    [onFileSelect]
  )

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled || isUploading) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [disabled, isUploading, handleFileSelect]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect]
  )

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    if (onFileRemove) {
      onFileRemove()
    }
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayError = error || uploadError

  return (
    <div className="space-y-2">
      {currentFile ? (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card">
          <div className="flex-shrink-0">
            <FileText className="w-10 h-10 text-ninma-purple" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {currentFile.fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(currentFile.fileSize)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={disabled || isUploading}
            aria-label="Remover arquivo"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div
          className={`
            relative flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed
            transition-colors cursor-pointer
            ${isDragging ? 'border-ninma-purple bg-ninma-purple/5' : 'border-border bg-card'}
            ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-ninma-purple hover:bg-ninma-purple/5'}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={!disabled && !isUploading ? handleClick : undefined}
          role="button"
          tabIndex={0}
          aria-label="Área de upload de arquivo"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClick()
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            aria-label="Selecionar arquivo"
          />

          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-ninma-purple animate-spin" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Fazendo upload...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-ninma-purple" aria-hidden="true" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Arraste e solte seu arquivo aqui
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ou clique para selecionar
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PDF, DOC, DOCX (máx. 10MB)
              </p>
            </>
          )}
        </div>
      )}

      {displayError && (
        <p className="text-sm text-destructive" role="alert">
          {displayError}
        </p>
      )}
    </div>
  )
}
