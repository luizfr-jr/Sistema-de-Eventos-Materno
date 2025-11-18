# 🎨 ninma hub - Sistema de Gestão de Eventos

![ninma hub](https://img.shields.io/badge/ninma-hub-8b7db8?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-316192?style=for-the-badge&logo=postgresql)

Sistema completo de gestão de eventos acadêmicos desenvolvido para o **ninma hub - Núcleo de Inovação Materno Infantil** da Universidade Franciscana (UFN).

---

## ✨ Funcionalidades Completas

### 🎯 Para Participantes
- ✅ Cadastro e autenticação segura
- 📅 Visualização de eventos disponíveis (grid responsivo)
- 📝 Inscrição em eventos com confirmação instantânea
- 📄 Envio de trabalhos acadêmicos com upload de arquivos
- ✓ Check-in via QR Code ou manual
- 🎓 Recebimento e download de certificados digitais
- 📊 Dashboard pessoal com estatísticas

### 👥 Para Coordenadores
- ➕ Criação e gerenciamento completo de eventos
- 📋 Controle de inscrições e aprovações
- ✓ Gerenciamento de presenças (QR Code ou manual)
- 📄 Avaliação de trabalhos acadêmicos
- 📜 Emissão de certificados em lote
- 📈 Relatórios detalhados e exportação CSV
- 📊 Dashboard com métricas de eventos

### 🔐 Para Administradores
- 👤 Gerenciamento completo de usuários
- 🏢 Gerenciamento de todos os eventos do sistema
- 📊 Dashboard com métricas globais
- ⚙️ Configurações do sistema
- 🔍 Auditoria de ações

### 🎓 Para Avaliadores
- 📄 Acesso a trabalhos para avaliação
- ⭐ Sistema de avaliação com 4 critérios
- 💬 Comentários e feedback
- ✅ Aprovação/rejeição de trabalhos

---

## 🚀 Tecnologias

### Frontend
- **Next.js 14** - Framework React com App Router e Server Components
- **TypeScript 5** - Tipagem estática e segurança de tipos
- **Tailwind CSS** - Estilização utilitária e responsiva
- **Framer Motion** - Animações fluidas
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Radix UI** - Componentes acessíveis
- **Lucide Icons** - Ícones modernos

### Backend
- **Next.js API Routes** - Backend integrado e serverless
- **Prisma ORM 5** - Object-Relational Mapping type-safe
- **PostgreSQL 14+** - Banco de dados relacional robusto
- **NextAuth.js v5** - Autenticação e autorização
- **bcryptjs** - Hash seguro de senhas

### Ferramentas
- **date-fns** - Manipulação de datas
- **jsPDF** - Geração de PDFs para certificados
- **qrcode** - Geração de QR Codes
- **React Hot Toast** - Notificações elegantes
- **Vercel Blob** - Storage de arquivos (pronto para usar)
- **Resend** - Envio de emails (infraestrutura pronta)

---

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn
- Git

---

## 🔧 Instalação Rápida

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/Sistema-de-Eventos-Materno.git
cd Sistema-de-Eventos-Materno
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ninma_hub?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cole-aqui-a-chave-gerada"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Configure o banco de dados

```bash
# Sincronizar schema com o banco de dados
npm run db:push

# Popular o banco com dados de exemplo
npm run db:seed
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## 👤 Credenciais de Teste

Após executar o seed, você pode fazer login com:

**👨‍💼 Administrador:**
- Email: `admin@ninmahub.com`
- Senha: `senha123`

**👨‍🏫 Coordenador:**
- Email: `coordenador@ninmahub.com`
- Senha: `senha123`

**🔬 Avaliador:**
- Email: `avaliadora@ninmahub.com`
- Senha: `senha123`

**🎓 Participante:**
- Email: `joao@exemplo.com`
- Senha: `senha123`

---

## 🗂️ Estrutura do Projeto

```
ninma-hub/
├── prisma/
│   ├── schema.prisma           # Schema do banco de dados
│   └── seed.ts                 # Dados iniciais
├── public/
│   ├── images/                 # Imagens estáticas
│   └── uploads/                # Arquivos enviados
├── src/
│   ├── app/
│   │   ├── (auth)/            # Rotas de autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Rotas protegidas
│   │   │   ├── dashboard/
│   │   │   ├── events/        # Gestão de eventos
│   │   │   ├── submissions/   # Trabalhos acadêmicos
│   │   │   ├── attendances/   # Controle de presenças
│   │   │   └── certificates/  # Certificados digitais
│   │   ├── api/               # API Routes
│   │   │   ├── auth/
│   │   │   ├── events/
│   │   │   ├── submissions/
│   │   │   ├── attendances/
│   │   │   └── certificates/
│   │   ├── layout.tsx         # Layout raiz
│   │   └── globals.css        # Estilos globais
│   ├── components/
│   │   ├── ui/                # Componentes UI base
│   │   ├── layout/            # Componentes de layout
│   │   ├── events/            # Componentes de eventos
│   │   ├── submissions/       # Componentes de trabalhos
│   │   ├── attendances/       # Componentes de presença
│   │   └── certificates/      # Componentes de certificados
│   ├── lib/
│   │   ├── auth.ts            # Configuração NextAuth
│   │   ├── prisma.ts          # Cliente Prisma
│   │   ├── validators.ts      # Schemas Zod
│   │   └── utils.ts           # Funções utilitárias
│   ├── services/              # Camada de serviços
│   │   ├── event.service.ts
│   │   ├── submission.service.ts
│   │   ├── attendance.service.ts
│   │   ├── certificate.service.ts
│   │   └── pdf.service.ts
│   ├── types/                 # Tipos TypeScript
│   └── middleware.ts          # Middleware de proteção
├── .env.example               # Exemplo de variáveis de ambiente
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json               # Configuração Vercel
```

---

## 🎨 Design System

O ninma hub utiliza um design system personalizado baseado na identidade visual da marca:

### Cores Principais

- **Purple** (#8b7db8) - Cor principal (botões, links, destaques)
- **Orange** (#f59e6c) - Secundária (badges, alertas)
- **Pink** (#ec4899) - Destaque (status, notificações)
- **Teal** (#5fb8a3) - Sucesso (confirmações, aprovações)

### Componentes UI

- **Button** - 6 variantes, 4 tamanhos, loading state
- **Input** - Com label, error, ícones, validação
- **Card** - 3 variantes, header/content/footer
- **Badge** - 12+ variantes de cores
- **Modal** - 5 tamanhos, animações
- **Toast** - 4 tipos (success, error, warning, info)
- **Spinner** - 3 variantes, overlay

---

## 📚 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                 # Inicia servidor de desenvolvimento

# Build e Produção
npm run build              # Build de produção
npm start                  # Inicia servidor de produção

# Linting e Formatação
npm run lint               # ESLint
npm run type-check         # TypeScript check
npm run format             # Prettier

# Banco de Dados
npm run db:push            # Sincronizar schema com o banco
npm run db:seed            # Popular banco com dados
npm run db:studio          # Abrir Prisma Studio (GUI do banco)
npm run db:migrate         # Criar migration
npm run db:generate        # Gerar Prisma Client

# Testes (infraestrutura pronta)
npm run test               # Rodar testes
npm run test:watch         # Testes em modo watch
npm run test:coverage      # Cobertura de código
npm run test:e2e           # Testes end-to-end
```

---

## 🔒 Segurança

O sistema implementa múltiplas camadas de segurança:

- ✅ Senhas hasheadas com bcrypt (salt rounds: 12)
- ✅ Autenticação com JWT via NextAuth.js
- ✅ Proteção de rotas server-side com middleware
- ✅ Validação de inputs (client + server) com Zod
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection (React + sanitização)
- ✅ CSRF protection (Next.js nativo)
- ✅ Role-based access control (RBAC)
- ✅ Logs de auditoria
- ✅ Headers de segurança (X-Frame-Options, CSP, etc.)
- ✅ Rate limiting (pronto para adicionar)

---

## 📊 Modelos de Dados

### User
Usuários do sistema com roles (ADMIN, COORDINATOR, REVIEWER, PARTICIPANT)

### Event
Eventos com informações completas, datas, local, capacidade, status

### Registration
Inscrições de usuários em eventos com status e confirmação

### Submission
Trabalhos acadêmicos enviados para eventos

### Review
Avaliações de trabalhos com ratings e comentários

### Attendance
Registro de presenças com check-in/check-out e método

### Certificate
Certificados digitais com código de verificação único

### SystemSettings
Configurações do sistema

### AuditLog
Logs de auditoria de ações críticas

---

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Acesse [vercel.com/new](https://vercel.com/new)
3. Importe o repositório
4. Configure as variáveis de ambiente
5. Deploy automático!

📖 **Guia completo:** [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

### Outras Opções
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify
- Azure Static Web Apps

---

## 📖 Documentação

- [📚 API Documentation](./API-DOCUMENTATION.md) - Documentação completa da API
- [🚀 Deployment Guide](./DEPLOYMENT-GUIDE.md) - Guia de deploy na Vercel
- [🧭 Sistema de Autoorientação](./SISTEMA-AUTOORIENTACAO.md) - Guia para desenvolvedores
- [📋 Checklist de Instalação](./CHECKLIST.md) - Checklist passo a passo
- [⚡ Quick Start](./QUICKSTART.md) - Início rápido
- [🔧 Technical Docs](./TECHNICAL.md) - Documentação técnica
- [📦 Manual do Usuário](./MANUAL.md) - Manual completo

---

## 🎯 Roadmap

### ✅ Fase 1 - Concluída (v1.0)
- [x] Sistema de autenticação
- [x] Gestão de eventos (CRUD completo)
- [x] Sistema de inscrições
- [x] Envio de trabalhos acadêmicos
- [x] Sistema de avaliação
- [x] Controle de presenças (QR Code + Manual)
- [x] Geração de certificados digitais
- [x] Dashboard com estatísticas
- [x] Design responsivo
- [x] Acessibilidade WCAG 2.1

### 🔄 Fase 2 - Em Planejamento (v2.0)
- [ ] Sistema de notificações por email
- [ ] Notificações push
- [ ] Chat em tempo real
- [ ] Integração com Google Calendar
- [ ] Pagamentos online (para eventos pagos)
- [ ] App mobile (React Native)
- [ ] Sistema de credenciamento
- [ ] Gamificação e badges

### 🌟 Fase 3 - Futuro (v3.0)
- [ ] Streaming de eventos ao vivo
- [ ] Networking entre participantes
- [ ] Marketplace de eventos
- [ ] IA para recomendação de eventos
- [ ] Analytics avançado
- [ ] Multi-tenancy (multi-instituições)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

**Padrões de código:**
- TypeScript estrito
- ESLint + Prettier
- Conventional Commits
- Testes para novas funcionalidades

---

## 🐛 Reportar Bugs

Encontrou um bug? Por favor, abra uma [issue](https://github.com/seu-usuario/Sistema-de-Eventos-Materno/issues) com:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Ambiente (browser, OS, versão do Node)

---

## 📝 Licença

Este projeto foi desenvolvido para a Universidade Franciscana - ninma hub.

Todos os direitos reservados © 2025 ninma hub - Núcleo de Inovação Materno Infantil

---

## 👨‍💻 Desenvolvido por

**Oryum Tech** - Software House 360°

- 🌐 Website: [oryumtech.com](https://oryumtech.com)
- 📧 Email: contato@oryumtech.com
- 📍 Localização: Caçapava do Sul, RS, Brasil

**Cliente:** ninma hub - Núcleo de Inovação Materno Infantil
**Instituição:** Universidade Franciscana (UFN)
**Localização:** Santa Maria, RS, Brasil

---

## 🙏 Agradecimentos

- Equipe do ninma hub pela confiança
- Universidade Franciscana pelo suporte
- Comunidade open-source pelas ferramentas incríveis
- Todos os contribuidores do projeto

---

## 📞 Suporte

Precisa de ajuda?

- 📧 Email: contato@oryumtech.com
- 💬 Issues: [GitHub Issues](https://github.com/seu-usuario/Sistema-de-Eventos-Materno/issues)
- 📖 Documentação: Veja os arquivos `.md` deste repositório

---

<div align="center">

## ⭐ Se este projeto foi útil, deixe uma estrela!

**ninma hub** - Inovando na gestão de eventos acadêmicos

Desenvolvido com ❤️ por **Oryum Tech**

</div>
