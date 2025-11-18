'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Award, Download, Search, Filter, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { CertificateCard } from '@/components/certificates/CertificateCard'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Certificate {
  id: string
  verificationCode: string
  workload: number
  role: string
  issuedAt: string
  validUntil: string | null
  event: {
    id: string
    title: string
    startDate: string
    endDate: string
    type: string
  }
  user: {
    id: string
    name: string
    email: string
    institution: string | null
  }
}

export default function CertificatesPage() {
  const { data: session } = useSession()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCertificates()
  }, [page])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/certificates?page=${page}&limit=12`)

      if (!response.ok) {
        throw new Error('Erro ao buscar certificados')
      }

      const data = await response.json()
      setCertificates(data.certificates)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching certificates:', error)
      toast.error('Erro ao carregar certificados')
    } finally {
      setLoading(false)
    }
  }

  const filteredCertificates = certificates.filter((cert) =>
    cert.event.title.toLowerCase().includes(search.toLowerCase()) ||
    cert.verificationCode.toLowerCase().includes(search.toLowerCase())
  )

  const isAdmin = (session?.user as any)?.role === 'ADMIN'
  const isCoordinator = (session?.user as any)?.role === 'COORDINATOR'
  const canManage = isAdmin || isCoordinator

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Award className="w-8 h-8 text-ninma-purple" aria-hidden="true" />
            Meus Certificados
          </h1>
          <p className="text-muted-foreground">
            {canManage
              ? 'Gerencie e visualize todos os certificados emitidos'
              : 'Visualize e baixe seus certificados de participação'}
          </p>
        </div>

        <Button asChild variant="primary">
          <Link href="/certificates/verify">
            Verificar Certificado
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-ninma-purple/10 rounded-lg">
                <Award className="w-6 h-6 text-ninma-purple" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {certificates.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-ninma-orange/10 rounded-lg">
                <Calendar className="w-6 h-6 text-ninma-orange" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Este Ano</p>
                <p className="text-2xl font-bold text-foreground">
                  {certificates.filter(c => {
                    const year = new Date(c.issuedAt).getFullYear()
                    return year === new Date().getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-ninma-teal/10 rounded-lg">
                <Download className="w-6 h-6 text-ninma-teal" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Carga Horária Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {certificates.reduce((acc, c) => acc + c.workload, 0)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card variant="bordered">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="text"
                placeholder="Buscar por evento ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                aria-label="Buscar certificados"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredCertificates.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="p-12 text-center">
            <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {search ? 'Nenhum certificado encontrado' : 'Nenhum certificado emitido'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {search
                ? 'Tente buscar com outros termos'
                : 'Participe de eventos e receba seus certificados'}
            </p>
            {!search && (
              <Button asChild variant="primary">
                <Link href="/events">
                  Explorar Eventos
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
