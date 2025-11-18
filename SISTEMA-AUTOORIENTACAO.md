# 🧭 DOCUMENTO DE AUTOORIENTAÇÃO DO SISTEMA
## ninma hub - Sistema de Gestão de Eventos Enterprise

> **Versão:** 2.0.0
> **Última Atualização:** 2025-11-18
> **Desenvolvedor:** Oryum Tech
> **Status:** Em Desenvolvimento

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Módulos e Funcionalidades](#módulos-e-funcionalidades)
4. [Estrutura de Diretórios](#estrutura-de-diretórios)
5. [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
6. [Fluxos de Trabalho](#fluxos-de-trabalho)
7. [Segurança](#segurança)
8. [Performance e Otimização](#performance-e-otimização)
9. [Testes](#testes)
10. [Deploy e CI/CD](#deploy-e-cicd)
11. [Manutenção](#manutenção)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

### Propósito do Sistema
O **ninma hub** é um sistema completo de gestão de eventos acadêmicos que gerencia:
- ✅ Eventos e conferências
- 📄 Envio e avaliação de trabalhos acadêmicos
- ✓ Registro e controle de presenças
- 🎓 Emissão de certificados digitais
- 📊 Analytics e relatórios

### Público-Alvo
- **Administradores**: Gestão completa do sistema
- **Coordenadores**: Gestão de eventos e trabalhos
- **Avaliadores**: Avaliação de trabalhos submetidos
- **Participantes**: Inscrição, envio de trabalhos, certificados

### Tecnologias Core
```
Frontend:  Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend:   Next.js API Routes + NextAuth.js
Database:  PostgreSQL + Prisma ORM
Deploy:    Vercel (Edge Functions + Serverless)
Storage:   Vercel Blob / AWS S3 (arquivos)
Email:     Resend / SendGrid
```

---

## 🏗️ ARQUITETURA DO SISTEMA

### Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────┐
│                  CAMADA DE APRESENTAÇÃO                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Next.js 14 App Router (React Server Components)│   │
│  │ - Pages (rotas)                                 │   │
│  │ - Components (UI reutilizável)                  │   │
│  │ - Layouts (estrutura)                           │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE APLICAÇÃO                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ API Routes (/app/api/*)                         │   │
│  │ - Autenticação (NextAuth.js)                    │   │
│  │ - Business Logic                                │   │
│  │ - Validação (Zod)                               │   │
│  │ - Middleware (proteção de rotas)                │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Prisma ORM
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE DADOS                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ PostgreSQL Database                             │   │
│  │ - Transações ACID                               │   │
│  │ - Relacionamentos complexos                     │   │
│  │ - Indexes otimizados                            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Princípios SOLID Aplicados

1. **Single Responsibility**: Cada componente/função tem uma única responsabilidade
2. **Open/Closed**: Aberto para extensão, fechado para modificação
3. **Liskov Substitution**: Componentes podem ser substituídos por suas abstrações
4. **Interface Segregation**: Interfaces específicas ao invés de genéricas
5. **Dependency Inversion**: Depender de abstrações, não implementações

### Padrões de Design

- **Repository Pattern**: Abstração do acesso a dados
- **Service Layer**: Lógica de negócio centralizada
- **DTO Pattern**: Objetos de transferência de dados
- **Factory Pattern**: Criação de objetos complexos
- **Observer Pattern**: Sistema de notificações

---

## 🧩 MÓDULOS E FUNCIONALIDADES

### 1. Módulo de Autenticação (`/auth`)

**Responsabilidade**: Gerenciar autenticação e autorização de usuários

**Componentes:**
- `LoginForm.tsx`: Formulário de login
- `RegisterForm.tsx`: Formulário de registro
- `auth.config.ts`: Configuração NextAuth
- `middleware.ts`: Proteção de rotas

**API Routes:**
- `POST /api/auth/signin`: Login
- `POST /api/auth/signup`: Registro
- `POST /api/auth/signout`: Logout
- `GET /api/auth/session`: Sessão atual

**Fluxo:**
```
Usuário → LoginForm → POST /api/auth/signin → NextAuth → JWT Token → Session
```

### 2. Módulo de Eventos (`/events`)

**Responsabilidade**: CRUD completo de eventos

**Funcionalidades:**
- Criar, editar, deletar eventos
- Gerenciar inscrições
- Controlar capacidade
- Agendar eventos
- Publicar/despublicar

**Componentes:**
- `EventList.tsx`: Lista de eventos
- `EventCard.tsx`: Card de evento
- `EventForm.tsx`: Formulário de criação/edição
- `EventDetail.tsx`: Detalhes do evento

**API Routes:**
- `GET /api/events`: Listar eventos
- `POST /api/events`: Criar evento
- `GET /api/events/[id]`: Detalhes
- `PATCH /api/events/[id]`: Atualizar
- `DELETE /api/events/[id]`: Deletar

**Modelo de Dados:**
```typescript
Event {
  id: string
  title: string
  description: string
  startDate: DateTime
  endDate: DateTime
  location: string
  capacity: number
  status: EventStatus
  allowSubmissions: boolean
  submissionDeadline: DateTime?
  createdBy: User
  registrations: Registration[]
  submissions: Submission[]
}
```

### 3. Módulo de Trabalhos Acadêmicos (`/submissions`)

**Responsabilidade**: Gerenciar envio e avaliação de trabalhos

**Funcionalidades:**
- Upload de trabalhos (PDF, DOC, DOCX)
- Avaliação por revisores
- Sistema de comentários
- Status de aprovação
- Download de trabalhos

**Componentes:**
- `SubmissionForm.tsx`: Formulário de envio
- `SubmissionList.tsx`: Lista de trabalhos
- `SubmissionReview.tsx`: Interface de avaliação
- `SubmissionStatus.tsx`: Status do trabalho

**API Routes:**
- `POST /api/submissions`: Enviar trabalho
- `GET /api/submissions`: Listar trabalhos
- `GET /api/submissions/[id]`: Detalhes
- `PATCH /api/submissions/[id]/review`: Avaliar
- `GET /api/submissions/[id]/download`: Download

**Modelo de Dados:**
```typescript
Submission {
  id: string
  eventId: string
  userId: string
  title: string
  abstract: string
  fileUrl: string
  fileName: string
  fileSize: number
  status: SubmissionStatus // PENDING, UNDER_REVIEW, APPROVED, REJECTED
  submittedAt: DateTime
  reviews: Review[]
  event: Event
  author: User
}

Review {
  id: string
  submissionId: string
  reviewerId: string
  rating: number
  comments: string
  status: ReviewStatus
  reviewedAt: DateTime
}
```

### 4. Módulo de Presenças (`/attendances`)

**Responsabilidade**: Controlar presença em eventos

**Funcionalidades:**
- Check-in/check-out
- QR Code para registro
- Registro manual
- Relatórios de presença
- Exportação de listas

**Componentes:**
- `AttendanceCheck.tsx`: Interface de check-in
- `QRCodeScanner.tsx`: Scanner de QR Code
- `AttendanceList.tsx`: Lista de presenças
- `AttendanceReport.tsx`: Relatórios

**API Routes:**
- `POST /api/attendances/checkin`: Check-in
- `POST /api/attendances/checkout`: Check-out
- `GET /api/events/[id]/attendances`: Lista de presenças
- `POST /api/attendances/manual`: Registro manual

**Modelo de Dados:**
```typescript
Attendance {
  id: string
  registrationId: string
  checkinAt: DateTime
  checkoutAt: DateTime?
  method: AttendanceMethod // QR_CODE, MANUAL, AUTOMATIC
  location: string?
  ipAddress: string?
  registration: Registration
}
```

### 5. Módulo de Certificados (`/certificates`)

**Responsabilidade**: Gerar e gerenciar certificados

**Funcionalidades:**
- Geração automática de certificados
- Templates personalizáveis
- Código de verificação
- Download em PDF
- Envio por email

**Componentes:**
- `CertificateGenerator.tsx`: Gerador de certificados
- `CertificateTemplate.tsx`: Template de certificado
- `CertificateList.tsx`: Lista de certificados
- `CertificateVerify.tsx`: Verificação de autenticidade

**API Routes:**
- `POST /api/certificates/generate`: Gerar certificado
- `GET /api/certificates/[id]`: Detalhes
- `GET /api/certificates/[id]/download`: Download PDF
- `GET /api/certificates/verify/[code]`: Verificar

**Modelo de Dados:**
```typescript
Certificate {
  id: string
  registrationId: string
  eventId: string
  userId: string
  verificationCode: string
  issuedAt: DateTime
  validUntil: DateTime?
  pdfUrl: string
  workload: number
  registration: Registration
  event: Event
  user: User
}
```

### 6. Módulo de Dashboard (`/dashboard`)

**Responsabilidade**: Painel de controle e analytics

**Funcionalidades:**
- Estatísticas gerais
- Gráficos de participação
- Eventos próximos
- Trabalhos pendentes
- Métricas de desempenho

**Componentes:**
- `DashboardStats.tsx`: Cards de estatísticas
- `DashboardCharts.tsx`: Gráficos
- `RecentActivity.tsx`: Atividades recentes
- `QuickActions.tsx`: Ações rápidas

---

## 📁 ESTRUTURA DE DIRETÓRIOS

```
ninma-hub/
├── prisma/
│   ├── schema.prisma              # Schema do banco de dados
│   ├── migrations/                # Migrações do banco
│   └── seed.ts                    # Dados iniciais
├── public/
│   ├── images/                    # Imagens estáticas
│   ├── icons/                     # Ícones
│   └── certificates/              # Templates de certificados
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/               # Grupo de rotas de auth
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/          # Grupo protegido
│   │   │   ├── dashboard/
│   │   │   ├── events/
│   │   │   ├── submissions/
│   │   │   ├── attendances/
│   │   │   └── certificates/
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/
│   │   │   ├── events/
│   │   │   ├── submissions/
│   │   │   ├── attendances/
│   │   │   └── certificates/
│   │   ├── layout.tsx            # Layout raiz
│   │   ├── page.tsx              # Homepage
│   │   └── globals.css           # Estilos globais
│   ├── components/               # Componentes React
│   │   ├── ui/                   # Componentes UI base
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   ├── layout/              # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── events/              # Componentes de eventos
│   │   ├── submissions/         # Componentes de trabalhos
│   │   ├── attendances/         # Componentes de presença
│   │   └── certificates/        # Componentes de certificados
│   ├── lib/                     # Bibliotecas e utilidades
│   │   ├── auth.ts              # Configuração NextAuth
│   │   ├── prisma.ts            # Cliente Prisma
│   │   ├── validators.ts        # Schemas Zod
│   │   ├── email.ts             # Serviço de email
│   │   ├── storage.ts           # Gerenciamento de arquivos
│   │   └── utils.ts             # Funções utilitárias
│   ├── services/                # Camada de serviços
│   │   ├── event.service.ts
│   │   ├── submission.service.ts
│   │   ├── attendance.service.ts
│   │   └── certificate.service.ts
│   ├── repositories/            # Camada de dados
│   │   ├── event.repository.ts
│   │   ├── submission.repository.ts
│   │   └── user.repository.ts
│   ├── types/                   # Tipos TypeScript
│   │   ├── models.ts
│   │   ├── api.ts
│   │   └── common.ts
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useEvents.ts
│   │   └── useToast.ts
│   └── middleware.ts            # Middleware Next.js
├── tests/                       # Testes
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example                 # Variáveis de ambiente exemplo
├── .eslintrc.json              # Configuração ESLint
├── .prettierrc                 # Configuração Prettier
├── next.config.js              # Configuração Next.js
├── tailwind.config.ts          # Configuração Tailwind
├── tsconfig.json               # Configuração TypeScript
├── package.json
└── vercel.json                 # Configuração Vercel
```

---

## 💻 PADRÕES DE DESENVOLVIMENTO

### Nomenclatura

**Arquivos:**
- Componentes: `PascalCase.tsx` (ex: `EventCard.tsx`)
- Hooks: `camelCase.ts` (ex: `useAuth.ts`)
- Utilitários: `camelCase.ts` (ex: `formatDate.ts`)
- Tipos: `PascalCase.ts` (ex: `UserTypes.ts`)

**Variáveis:**
- Constantes: `UPPER_SNAKE_CASE` (ex: `MAX_FILE_SIZE`)
- Variáveis: `camelCase` (ex: `userName`)
- Componentes: `PascalCase` (ex: `EventList`)
- Funções: `camelCase` (ex: `getUserById`)

### Estrutura de Componentes

```typescript
// 1. Imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

// 2. Types
interface EventCardProps {
  event: Event
  onDelete?: (id: string) => void
}

// 3. Component
export function EventCard({ event, onDelete }: EventCardProps) {
  // 3.1 Hooks
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  // 3.2 Handlers
  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete?.(event.id)
    setIsDeleting(false)
  }

  // 3.3 Render
  return (
    <div className="card">
      {/* JSX */}
    </div>
  )
}
```

### API Routes Pattern

```typescript
// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { eventService } from '@/services/event.service'
import { eventSchema } from '@/lib/validators'

export async function GET(req: NextRequest) {
  try {
    // 1. Autenticação
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Buscar dados
    const events = await eventService.findAll()

    // 3. Retornar resposta
    return NextResponse.json(events)
  } catch (error) {
    // 4. Tratamento de erros
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validar dados
    const body = await req.json()
    const validatedData = eventSchema.parse(body)

    // Criar evento
    const event = await eventService.create(validatedData, session.user.id)

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Service Layer Pattern

```typescript
// services/event.service.ts
import { eventRepository } from '@/repositories/event.repository'
import { emailService } from '@/services/email.service'

export const eventService = {
  async findAll() {
    return await eventRepository.findAll()
  },

  async findById(id: string) {
    const event = await eventRepository.findById(id)
    if (!event) {
      throw new Error('Event not found')
    }
    return event
  },

  async create(data: CreateEventDTO, userId: string) {
    // Lógica de negócio
    const event = await eventRepository.create({
      ...data,
      createdById: userId,
      status: 'DRAFT'
    })

    // Notificações
    await emailService.sendEventCreatedNotification(event)

    return event
  }
}
```

---

## 🔄 FLUXOS DE TRABALHO

### Fluxo de Criação de Evento

```
1. Coordenador acessa /dashboard/events/new
2. Preenche formulário (validação client-side com Zod)
3. Submit → POST /api/events
4. API valida autenticação e autorização
5. API valida dados novamente (server-side)
6. Service Layer processa lógica de negócio
7. Repository salva no banco
8. Email de notificação enviado
9. Retorna evento criado
10. Redirect para /dashboard/events/[id]
```

### Fluxo de Envio de Trabalho

```
1. Participante acessa /dashboard/events/[id]/submit
2. Preenche formulário + upload de arquivo
3. Upload para storage (Vercel Blob/S3)
4. Submit → POST /api/submissions
5. API valida arquivo (tipo, tamanho)
6. Cria registro no banco
7. Notifica coordenador/avaliadores
8. Status: PENDING
9. Avaliador revisa
10. Status: APPROVED/REJECTED
```

### Fluxo de Check-in

```
1. Participante chega ao evento
2. Coordenador escaneia QR Code ou busca manualmente
3. POST /api/attendances/checkin
4. Valida inscrição ativa
5. Registra horário de check-in
6. Atualiza status da inscrição
7. Confirmação visual
```

---

## 🔒 SEGURANÇA

### Checklist de Segurança

- [ ] Senhas hasheadas com bcrypt (salt rounds: 12)
- [ ] JWT tokens com expiração
- [ ] HTTPS obrigatório em produção
- [ ] CSRF protection
- [ ] XSS protection
- [ ] SQL Injection protection (Prisma)
- [ ] Rate limiting nas APIs
- [ ] Validação de inputs (client + server)
- [ ] Sanitização de dados
- [ ] Proteção de rotas (middleware)
- [ ] Role-based access control (RBAC)
- [ ] Logs de auditoria
- [ ] Variáveis de ambiente seguras

### Roles e Permissões

```typescript
enum UserRole {
  ADMIN       // Acesso total
  COORDINATOR // Gerenciar eventos e trabalhos
  REVIEWER    // Avaliar trabalhos
  PARTICIPANT // Inscrever e enviar trabalhos
}

Permissões:
- ADMIN: *
- COORDINATOR: events.*, submissions.review, attendances.*
- REVIEWER: submissions.review
- PARTICIPANT: events.read, events.register, submissions.create
```

---

## ⚡ PERFORMANCE E OTIMIZAÇÃO

### Estratégias

1. **Server Components**: Usar RSC por padrão
2. **Streaming**: Loading.tsx para carregamento progressivo
3. **Image Optimization**: Next.js Image component
4. **Code Splitting**: Lazy loading de componentes
5. **Database Indexes**: Campos frequentemente consultados
6. **Caching**: React Cache + Next.js cache
7. **Prefetching**: Link prefetch
8. **Bundle Size**: Análise com @next/bundle-analyzer

### Métricas Alvo

- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TTI** (Time to Interactive): < 3.8s
- **CLS** (Cumulative Layout Shift): < 0.1
- **Lighthouse Score**: > 90

---

## 🧪 TESTES

### Pirâmide de Testes

```
      /\
     /E2E\        10% - Testes End-to-End (Playwright)
    /──────\
   /Integ.  \     20% - Testes de Integração (API)
  /──────────\
 /   Unit     \   70% - Testes Unitários (Jest + RTL)
/──────────────\
```

### Comandos

```bash
npm run test              # Todos os testes
npm run test:unit         # Testes unitários
npm run test:integration  # Testes de integração
npm run test:e2e          # Testes E2E
npm run test:coverage     # Cobertura de código
```

---

## 🚀 DEPLOY E CI/CD

### Pipeline CI/CD

```yaml
1. Push para branch → GitHub Actions
2. Install dependencies
3. Lint (ESLint)
4. Type check (TypeScript)
5. Run tests
6. Build application
7. Deploy to Vercel (preview/production)
8. Run E2E tests on preview
9. Notify team
```

### Variáveis de Ambiente

```env
# Database
DATABASE_URL=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Storage
BLOB_READ_WRITE_TOKEN=

# Email
RESEND_API_KEY=

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=
```

---

## 🔧 MANUTENÇÃO

### Checklist Semanal

- [ ] Revisar logs de erro
- [ ] Verificar performance (Vercel Analytics)
- [ ] Atualizar dependências (npm outdated)
- [ ] Backup do banco de dados
- [ ] Revisar pull requests

### Checklist Mensal

- [ ] Análise de segurança
- [ ] Otimização de queries
- [ ] Limpeza de dados antigos
- [ ] Atualização de documentação
- [ ] Review de código técnico

---

## 🐛 TROUBLESHOOTING

### Problemas Comuns

**1. Erro de conexão com banco**
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL
# Testar conexão
npx prisma db push
```

**2. Build falha**
```bash
# Limpar cache
rm -rf .next
npm run build
```

**3. Upload de arquivo falha**
```bash
# Verificar limites de tamanho
# Configurar em next.config.js
```

---

## 📚 RECURSOS ADICIONAIS

### Documentação
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Ferramentas
- Prisma Studio: `npm run db:studio`
- Vercel Dashboard: https://vercel.com
- Database GUI: pgAdmin / TablePlus

---

## 📞 CONTATO E SUPORTE

**Desenvolvedor:** Oryum Tech
**Email:** contato@oryumtech.com
**Localização:** Caçapava do Sul, RS, Brasil

---

<div align="center">

## ✅ SISTEMA PRONTO PARA DESENVOLVIMENTO

**Siga este guia para manter consistência e qualidade**

Última atualização: 2025-11-18

</div>
