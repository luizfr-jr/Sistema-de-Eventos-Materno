# 🚀 Guia de Instalação Rápida - ninma hub

## Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ disponível
- Git instalado

## Passos de Instalação

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ninma_hub"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cole-aqui-a-chave-gerada"
```

Para gerar o `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Configurar Banco de Dados

```bash
# Sincronizar schema com o banco
npm run db:push

# Popular com dados iniciais
npm run db:seed
```

### 4. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Credenciais de Teste

Após executar o seed, use:

**Administrador:**
- Email: `admin@ninmahub.com`
- Senha: `senha123`

**Coordenador:**
- Email: `coordenador@ninmahub.com`
- Senha: `senha123`

**Participante:**
- Email: `joao@exemplo.com`
- Senha: `senha123`

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Abrir Prisma Studio
npm run db:studio

# Lint
npm run lint
```

## Próximos Passos

1. Explore o sistema com as credenciais de teste
2. Personalize as cores e branding
3. Configure email e storage para produção
4. Revise as configurações de segurança

## Problemas Comuns

**Erro de conexão com banco:**
- Verifique se o PostgreSQL está rodando
- Confirme a `DATABASE_URL` no `.env`

**Port 3000 em uso:**
```bash
PORT=3001 npm run dev
```

## Suporte

Consulte:
- [SISTEMA-AUTOORIENTACAO.md](./SISTEMA-AUTOORIENTACAO.md) - Guia completo
- [README.md](./README.md) - Documentação geral
- [TECHNICAL.md](./TECHNICAL.md) - Detalhes técnicos
