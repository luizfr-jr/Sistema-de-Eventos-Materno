'use client'

import Link from 'next/link'
import { FileText, Calendar, Users, Download, Eye } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SubmissionStatus } from './SubmissionStatus'
import { formatDate, truncate, formatFileSize } from '@/lib/utils'
import { SubmissionStatus as Status } from '@prisma/client'

interface SubmissionCardProps {
  submission: {
    id: string
    title: string
    abstract: string
    keywords: string[]
    authors: any
    fileUrl: string
    fileName: string
    fileSize: number
    status: Status
    submittedAt: Date | string
    event: {
      id: string
      title: string
      slug: string
    }
    author: {
      id: string
      name: string
      email: string
      institution?: string | null
    }
    _count?: {
      reviews: number
    }
  }
  showActions?: boolean
  showEvent?: boolean
  currentUserId?: string
}

export function SubmissionCard({
  submission,
  showActions = true,
  showEvent = true,
  currentUserId,
}: SubmissionCardProps) {
  const submittedDate = new Date(submission.submittedAt)
  const authors = Array.isArray(submission.authors) ? submission.authors : []
  const isOwner = currentUserId === submission.author.id
  const reviewCount = submission._count?.reviews || 0

  return (
    <Card variant="bordered" className="hover:shadow-md transition-shadow">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <SubmissionStatus status={submission.status} />

            <Link
              href={`/submissions/${submission.id}`}
              className="group"
              aria-label={`Ver detalhes de ${submission.title}`}
            >
              <h3 className="text-xl font-semibold text-foreground group-hover:text-ninma-purple transition-colors line-clamp-2">
                {submission.title}
              </h3>
            </Link>

            {showEvent && (
              <Link
                href={`/events/${submission.event.id}`}
                className="text-sm text-ninma-purple hover:underline inline-flex items-center gap-1"
              >
                <FileText className="w-3 h-3" aria-hidden="true" />
                {submission.event.title}
              </Link>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">
          {truncate(submission.abstract, 200)}
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <time dateTime={submittedDate.toISOString()}>
              Enviado em {formatDate(submittedDate, true)}
            </time>
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <span className="font-medium">Autores:</span>{' '}
              {authors.length > 0
                ? authors.map((a: any) => a.name).join(', ')
                : submission.author.name}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>
              {submission.fileName} ({formatFileSize(submission.fileSize)})
            </span>
          </div>

          {reviewCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>
                {reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'}
              </span>
            </div>
          )}
        </div>

        {submission.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {submission.keywords.slice(0, 3).map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md bg-ninma-purple/10 text-ninma-purple text-xs"
              >
                {keyword}
              </span>
            ))}
            {submission.keywords.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 text-xs text-muted-foreground">
                +{submission.keywords.length - 3} mais
              </span>
            )}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter divider className="gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Link href={`/submissions/${submission.id}`}>
              <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
              Ver Detalhes
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
          >
            <a
              href={submission.fileUrl}
              download={submission.fileName}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Baixar ${submission.fileName}`}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
