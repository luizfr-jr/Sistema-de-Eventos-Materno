# 🛠️ Documentação Técnica - ninma hub

Guia técnico completo para desenvolvedores que desejam contribuir ou entender a arquitetura do projeto.

## 🏗️ Arquitetura

### Stack Tecnológica

```
┌─────────────────────────────────────────┐
│           Next.js 14 (App Router)       │
├─────────────────────────────────────────┤
│  Frontend     │  Backend (API Routes)   │
├───────────────┼─────────────────────────┤
│  React 18     │  NextAuth.js            │
│  TypeScript   │  Prisma ORM             │
│  Tailwind CSS │  PostgreSQL             │
│  Framer Motion│  Zod Validation         │
└───────────────┴─────────────────────────┘
```

### Padrões de Design

- **MVC**: Separação clara entre Model (Prisma), View (React), Controller (API Routes)
- **Repository Pattern**: Acesso ao banco através do Prisma
- **Server Components**: Uso extensivo de RSC para melhor performance
- **API Routes**: Backend RESTful integrado

## 📁 Estrutura Detalhada

```
ninma-hub/
│
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── seed.ts                # Dados iniciais
│
├── src/
│   ├── app/                   # App Router do Next.js
│   │   ├── api/               # API Routes
│   │   │   └── auth/          # Rotas de autenticação
│   │   ├── dashboard/         # Área autenticada
│   │   │   ├── events/        # Gestão de eventos
│   │   │   ├── registrations/ # Inscrições
│   │   │   ├── certificates/  # Certificados
│   │   │   ├── users/         # Usuários (admin)
│   │   │   └── reports/       # Relatórios
│   │   ├── login/             # Página de login
│   │   ├── register/          # Página de registro
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Home (redirect)
│   │   └── globals.css        # Estilos globais
│   │
│   ├── components/
│   │   ├── layout/            # Componentes de layout
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navbar.tsx
│   │   ├── ui/                # Componentes reutilizáveis
│   │   │   ├── NinmaLogo.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Card.tsx
│   │   └── providers/         # Context providers
│   │       └── Providers.tsx
│   │
│   ├── lib/
│   │   ├── auth.ts            # Configuração NextAuth
│   │   ├── prisma.ts          # Cliente Prisma
│   │   └── utils.ts           # Utilitários
│   │
│   └── types/
│       └── next-auth.d.ts     # Types do NextAuth
│
├── public/                    # Arquivos estáticos
├── .env.example               # Exemplo de variáveis
├── next.config.mjs            # Config do Next.js
├── tailwind.config.ts         # Config do Tailwind
├── tsconfig.json              # Config do TypeScript
└── package.json               # Dependências
```

## 🗄️ Schema do Banco de Dados

### Diagrama ER

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│    User     │──────<│Registration │>──────│    Event     │
└─────────────┘       └─────────────┘       └──────────────┘
       │                     │                      │
       │                     │                      │
       ▼                     ▼                      ▼
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│ Certificate │       │ Attendance  │       │   Settings   │
└─────────────┘       └─────────────┘       └──────────────┘
```

### Modelos Principais

#### User
```prisma
model User {
  id            String       @id @default(cuid())
  name          String
  email         String       @unique
  password      String
  role          UserRole     @default(PARTICIPANT)
  phone         String?
  institution   String?
  // ... relações
}
```

#### Event
```prisma
model Event {
  id              String        @id @default(cuid())
  title           String
  description     String        @db.Text
  eventDate       DateTime
  status          EventStatus   @default(DRAFT)
  maxParticipants Int?
  // ... mais campos
}
```

#### Registration
```prisma
model Registration {
  id              String              @id @default(cuid())
  userId          String
  eventId         String
  status          RegistrationStatus  @default(PENDING)
  // ... mais campos
}
```

## 🔐 Autenticação

### NextAuth Configuration

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // Configuração de credentials
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // JWT callback
    },
    async session({ session, token }) {
      // Session callback
    }
  }
};
```

### Proteção de Rotas

**Server-side:**
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  // Página protegida
}
```

**Client-side:**
```typescript
'use client';
import { useSession } from 'next-auth/react';

export function ProtectedComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <Loading />;
  if (status === 'unauthenticated') return <Login />;
  
  return <Component />;
}
```

## 🔄 API Routes

### Estrutura de uma API Route

```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação
const schema = z.object({
  field: z.string().min(3),
});

// GET
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const data = await prisma.model.findMany();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}

// POST
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = schema.parse(body);

    const created = await prisma.model.create({
      data: validated,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}
```

## 🎨 Design System

### Cores Principais

```typescript
// tailwind.config.ts
colors: {
  ninma: {
    purple: '#8b7db8',  // Cor principal
    orange: '#f59e6c',  // Secundária
    pink: '#ec4899',    // Destaque
    teal: '#5fb8a3',    // Sucesso
  }
}
```

### Classes Utilitárias

```css
/* Buttons */
.btn             /* Base button */
.btn-primary     /* Purple button */
.btn-secondary   /* Orange button */
.btn-outline     /* Outlined button */

/* Cards */
.card            /* Base card */
.card-ninma      /* Branded card */
.card-hover      /* Card with hover effect */

/* Inputs */
.input           /* Base input */
.label           /* Input label */

/* Badges */
.badge           /* Base badge */
.badge-purple    /* Purple badge */
.badge-orange    /* Orange badge */
```

## 🧪 Testes

### Setup de Testes

```bash
npm install -D @testing-library/react @testing-library/jest-dom jest
```

### Exemplo de Teste

```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 📊 Performance

### Otimizações Implementadas

1. **Server Components**: Maioria dos componentes são RSC
2. **Image Optimization**: Uso do next/image
3. **Route Caching**: Configurado no Next.js
4. **Database Connection Pooling**: Via Prisma

### Métricas Alvo

- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.8s
- **Cumulative Layout Shift**: < 0.1

## 🔧 Configurações Importantes

### Next.js Config

```javascript
// next.config.mjs
const nextConfig = {
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};
```

### Prisma Config

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 🚀 Scripts Úteis

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  }
}
```

## 🤝 Contribuindo

### Processo de Contribuição

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add: nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

### Convenções de Commit

```
feat: Nova funcionalidade
fix: Correção de bug
docs: Documentação
style: Formatação
refactor: Refatoração
test: Testes
chore: Tarefas gerais
```

### Code Style

- Use TypeScript
- Siga ESLint rules
- Use Prettier para formatação
- Componentes em PascalCase
- Funções em camelCase

## 📚 Recursos Adicionais

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Desenvolvido com ❤️ por Oryum Tech**
