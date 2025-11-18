import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { submissionService } from '@/services/submission.service'
import { ReviewForm } from '@/components/submissions/ReviewForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AlertCircle, FileText, Users, Download } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'
import { UserRole, SubmissionStatus } from '@prisma/client'

interface PageProps {
  params: {
    id: string
  }
}

export default async function ReviewSubmissionPage({ params }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userRole = (session.user as any).role

  // Check if user has permission to review
  if (
    userRole !== UserRole.REVIEWER &&
    userRole !== UserRole.COORDINATOR &&
    userRole !== UserRole.ADMIN
  ) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card variant="bordered">
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">
                Acesso não autorizado
              </h2>
              <p className="text-muted-foreground">
                Você não tem permissão para avaliar trabalhos acadêmicos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const submission = await submissionService.getSubmissionById(params.id)

  if (!submission) {
    notFound()
  }

  // Check if user can review this specific submission
  const canReview = await submissionService.canUserReviewSubmission(
    session.user.id!,
    params.id
  )

  if (!canReview) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card variant="bordered">
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">
                Não é possível avaliar esta submissão
              </h2>
              <p className="text-muted-foreground">
                Você não pode avaliar seu próprio trabalho ou um trabalho que já avaliou.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if submission is under review
  if (submission.status !== SubmissionStatus.UNDER_REVIEW) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card variant="bordered">
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-warning mx-auto" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-foreground">
                Submissão não disponível para avaliação
              </h2>
              <p className="text-muted-foreground">
                Esta submissão não está no status &quot;Em Avaliação&quot;.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const authors = Array.isArray(submission.authors) ? submission.authors : []

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Avaliar Trabalho</h1>
          <p className="text-muted-foreground mt-2">
            Forneça sua avaliação detalhada do trabalho acadêmico
          </p>
        </div>

        {/* Submission Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle as="h2">{submission.title}</CardTitle>
              <CardDescription>
                <Link
                  href={`/events/${submission.event.id}`}
                  className="text-ninma-purple hover:underline inline-flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" aria-hidden="true" />
                  {submission.event.title}
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <Users className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <span className="text-muted-foreground">Autor principal:</span>
                  <br />
                  <span className="font-medium">{submission.author.name}</span>
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

              <div className="text-sm">
                <span className="text-muted-foreground">Submetido em:</span>
                <br />
                <time dateTime={new Date(submission.submittedAt).toISOString()}>
                  {formatDate(submission.submittedAt, true)}
                </time>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle as="h2">Co-autores e Palavras-chave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Co-autores</h3>
                {authors.length > 0 ? (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {authors.map((author: any, index: number) => (
                      <li key={index}>
                        {author.name}
                        {author.institution && ` - ${author.institution}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum co-autor</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Palavras-chave</h3>
                <div className="flex flex-wrap gap-2">
                  {submission.keywords.map((keyword, index) => (
                    <Badge key={index} variant="purple-outline" size="sm">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
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

        {/* Review Form */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle as="h2">Avaliação</CardTitle>
            <CardDescription>
              Avalie o trabalho de acordo com os critérios estabelecidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewForm submissionId={params.id} />
          </CardContent>
        </Card>

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
