import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { submissionService } from '@/services/submission.service'
import { SubmissionStatus as StatusComponent } from '@/components/submissions/SubmissionStatus'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  FileText,
  Calendar,
  Users,
  Download,
  Edit,
  Star,
  MessageSquare,
} from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'
import { UserRole, SubmissionStatus, ReviewStatus } from '@prisma/client'

interface PageProps {
  params: {
    id: string
  }
}

const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  REVISION: 'Revisão Solicitada',
}

const REVIEW_STATUS_VARIANTS: Record<ReviewStatus, any> = {
  PENDING: 'outline',
  APPROVED: 'success',
  REJECTED: 'destructive',
  REVISION: 'warning',
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const submission = await submissionService.getSubmissionById(params.id)

  if (!submission) {
    notFound()
  }

  const userRole = (session.user as any).role
  const isOwner = submission.userId === session.user.id
  const canReview = await submissionService.canUserReviewSubmission(
    session.user.id!,
    params.id
  )
  const canEdit =
    isOwner &&
    (submission.status === SubmissionStatus.DRAFT ||
      submission.status === SubmissionStatus.REVISION)

  const authors = Array.isArray(submission.authors) ? submission.authors : []

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{submission.title}</h1>
            <Link
              href={`/events/${submission.event.id}`}
              className="text-sm text-ninma-purple hover:underline inline-flex items-center gap-1 mt-2"
            >
              <FileText className="w-3 h-3" aria-hidden="true" />
              {submission.event.title}
            </Link>
          </div>

          <div className="flex gap-2">
            {canEdit && (
              <Button asChild variant="outline">
                <Link href={`/submissions/${params.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                  Editar
                </Link>
              </Button>
            )}

            {canReview && submission.status === SubmissionStatus.UNDER_REVIEW && (
              <Button asChild variant="primary">
                <Link href={`/submissions/${params.id}/review`}>
                  <Star className="w-4 h-4 mr-2" aria-hidden="true" />
                  Avaliar
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Status */}
        <Card variant="bordered">
          <CardContent className="pt-6">
            <StatusComponent status={submission.status} showWorkflow />
          </CardContent>
        </Card>

        {/* Basic Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle as="h2">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <span className="text-muted-foreground">Submetido em:</span>
                  <br />
                  <time dateTime={new Date(submission.submittedAt).toISOString()}>
                    {formatDate(submission.submittedAt, true)}
                  </time>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Users className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <span className="text-muted-foreground">Autor principal:</span>
                  <br />
                  <span className="font-medium">{submission.author.name}</span>
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {submission.author.email}
                  </span>
                  {submission.author.institution && (
                    <>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {submission.author.institution}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <FileText className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <span className="text-muted-foreground">Arquivo:</span>
                  <br />
                  <a
                    href={submission.fileUrl}
                    download={submission.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ninma-purple hover:underline inline-flex items-center gap-1"
                  >
                    {submission.fileName}
                    <Download className="w-3 h-3" aria-hidden="true" />
                  </a>
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(submission.fileSize)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle as="h2">Co-autores</CardTitle>
            </CardHeader>
            <CardContent>
              {authors.length > 0 ? (
                <ul className="space-y-3">
                  {authors.map((author: any, index: number) => (
                    <li key={index} className="text-sm">
                      <p className="font-medium">{author.name}</p>
                      <p className="text-xs text-muted-foreground">{author.email}</p>
                      {author.institution && (
                        <p className="text-xs text-muted-foreground">{author.institution}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum co-autor adicionado</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Abstract */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle as="h2">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {submission.abstract}
            </p>
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle as="h2">Palavras-chave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {submission.keywords.map((keyword, index) => (
                <Badge key={index} variant="purple-outline" size="md">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        {submission.reviews && submission.reviews.length > 0 && (
          <Card variant="bordered">
            <CardHeader>
              <CardTitle as="h2">Avaliações</CardTitle>
              <CardDescription>
                {submission.reviews.length}{' '}
                {submission.reviews.length === 1 ? 'avaliação' : 'avaliações'} recebidas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submission.reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-lg border border-border bg-card space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {isOwner || userRole === UserRole.ADMIN || userRole === UserRole.COORDINATOR
                          ? review.reviewer.name
                          : 'Avaliador'}
                      </p>
                      <time className="text-xs text-muted-foreground" dateTime={new Date(review.reviewedAt).toISOString()}>
                        {formatDate(review.reviewedAt, true)}
                      </time>
                    </div>
                    <Badge variant={REVIEW_STATUS_VARIANTS[review.status]} size="sm">
                      {REVIEW_STATUS_LABELS[review.status]}
                    </Badge>
                  </div>

                  {review.originality && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Originalidade:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.originality!
                                  ? 'text-ninma-orange fill-ninma-orange'
                                  : 'text-muted-foreground'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Relevância:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.relevance!
                                  ? 'text-ninma-orange fill-ninma-orange'
                                  : 'text-muted-foreground'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Metodologia:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.methodology!
                                  ? 'text-ninma-orange fill-ninma-orange'
                                  : 'text-muted-foreground'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Clareza:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.clarity!
                                  ? 'text-ninma-orange fill-ninma-orange'
                                  : 'text-muted-foreground'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {review.comments && (
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {review.comments}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Guidelines */}
        {submission.event.submissionGuidelines && (
          <Card variant="bordered">
            <CardHeader>
              <CardTitle as="h2">Diretrizes do Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: submission.event.submissionGuidelines }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
