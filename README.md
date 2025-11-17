# 🎨 ninma hub - Sistema de Gestão de Eventos

![ninma hub](https://img.shields.io/badge/ninma-hub-8b7db8?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)

Sistema completo de gestão de eventos acadêmicos desenvolvido para o **ninma hub - Núcleo de Inovação Materno Infantil** da Universidade Franciscana (UFN).

## ✨ Funcionalidades

### 🎯 Para Participantes
- ✅ Cadastro e autenticação segura
- 📅 Visualização de eventos disponíveis
- 📝 Inscrição em eventos com confirmação
- 🎓 Recebimento de certificados digitais
- 📊 Dashboard pessoal com estatísticas

### 👥 Para Coordenadores
- ➕ Criação e gerenciamento de eventos
- 📋 Controle de inscrições
- ✓ Gerenciamento de presenças
- 📜 Emissão de certificados
- 📈 Relatórios detalhados

### 🔐 Para Administradores
- 👤 Gerenciamento de usuários
- 🏢 Gerenciamento completo de eventos
- 📊 Dashboard com métricas globais
- ⚙️ Configurações do sistema

## 🚀 Tecnologias

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Framer Motion** - Animações
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend
- **Next.js API Routes** - Backend integrado
- **Prisma ORM** - Object-Relational Mapping
- **PostgreSQL** - Banco de dados relacional
- **NextAuth.js** - Autenticação
- **bcryptjs** - Hash de senhas

### Ferramentas
- **date-fns** - Manipulação de datas
- **jsPDF** - Geração de PDFs
- **xlsx** - Exportação de planilhas
- **React Hot Toast** - Notificações

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd ninma-hub
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
NEXTAUTH_SECRET="your-secret-key-here"
```

### 4. Configure o banco de dados

```bash
# Criar as tabelas no banco de dados
npm run db:push

# Popular o banco com dados de exemplo
npm run db:seed
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 👤 Credenciais de Teste

Após executar o seed, você pode fazer login com:

**Administrador:**
- Email: `admin@ninmahub.com`
- Senha: `senha123`

**Coordenador:**
- Email: `coordenador@ninmahub.com`
- Senha: `senha123`

**Participante:**
- Email: `joao@exemplo.com`
- Senha: `senha123`

## 🗂️ Estrutura do Projeto

```
ninma-hub/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   └── seed.ts            # Seed de dados iniciais
├── src/
│   ├── app/
│   │   ├── api/           # API Routes
│   │   ├── dashboard/     # Páginas do dashboard
│   │   ├── login/         # Página de login
│   │   ├── register/      # Página de registro
│   │   ├── layout.tsx     # Layout principal
│   │   └── globals.css    # Estilos globais
│   ├── components/
│   │   ├── layout/        # Componentes de layout
│   │   ├── ui/            # Componentes UI
│   │   └── providers/     # Providers (Auth, etc)
│   ├── lib/
│   │   ├── auth.ts        # Configuração do NextAuth
│   │   └── prisma.ts      # Cliente do Prisma
│   └── types/             # Tipos TypeScript
├── public/                # Arquivos públicos
└── package.json
```

## 🎨 Design System

O ninma hub utiliza um design system personalizado baseado na identidade visual da marca:

### Cores

- **Purple** (#8b7db8) - Cor principal
- **Orange** (#f59e6c) - Secundária
- **Pink** (#ec4899) - Destaque
- **Teal** (#5fb8a3) - Sucesso

### Componentes

- Buttons: `.btn`, `.btn-primary`, `.btn-secondary`
- Cards: `.card`, `.card-ninma`, `.card-hover`
- Inputs: `.input`, `.label`
- Badges: `.badge`, `.badge-purple`, `.badge-orange`

## 📚 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm start

# Lint
npm run lint

# Prisma
npm run db:push       # Sincronizar schema com o banco
npm run db:seed       # Popular banco com dados
npm run db:studio     # Abrir Prisma Studio
```

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Autenticação com JWT
- ✅ Proteção de rotas server-side
- ✅ Validação de inputs com Zod
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection

## 📊 Modelos de Dados

### User
- Informações pessoais
- Roles (ADMIN, COORDINATOR, PARTICIPANT)
- Instituição e curso

### Event
- Informações do evento
- Datas e horários
- Local e capacidade
- Status (DRAFT, OPEN, CLOSED, CANCELLED, COMPLETED)

### Registration
- Inscrição do usuário no evento
- Status (PENDING, CONFIRMED, CANCELLED, ATTENDED, ABSENT)
- Check-in/check-out

### Certificate
- Certificado digital
- Código de verificação
- Carga horária

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Conecte no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

### Outras opções
- Railway
- Render
- DigitalOcean App Platform

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto foi desenvolvido para a Universidade Franciscana - ninma hub.

## 👨‍💻 Desenvolvido por

**Oryum Tech** - Software House 360°
- Website: [oryumtech.com](https://oryumtech.com)
- Localização: Caçapava do Sul, RS, Brasil

---

<div align="center">
  
**ninma hub** - Núcleo de Inovação Materno Infantil  
Universidade Franciscana - UFN

</div>
