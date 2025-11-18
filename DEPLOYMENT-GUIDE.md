# 🚀 Guia de Deploy - ninma hub na Vercel

Este guia detalha como fazer deploy do sistema ninma hub na plataforma Vercel.

---

## 📋 Pré-requisitos

- [ ] Conta na [Vercel](https://vercel.com)
- [ ] Conta no [GitHub](https://github.com)
- [ ] Banco de dados PostgreSQL hospedado (sugestões abaixo)
- [ ] Código commitado no GitHub

---

## 🗄️ Passo 1: Configurar Banco de Dados

### Opção A: Neon (Recomendado - Gratuito)

1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta e um novo projeto
3. Copie a **Connection String**
4. Guarde para usar nas variáveis de ambiente

### Opção B: Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um projeto
3. Vá em **Settings → Database**
4. Copie a **Connection String** (modo "Session")

### Opção C: Railway

1. Acesse [railway.app](https://railway.app)
2. Crie um novo projeto
3. Adicione PostgreSQL
4. Copie a **Connection String**

---

## 🔐 Passo 2: Gerar Secrets

### NEXTAUTH_SECRET

Execute no terminal:
```bash
openssl rand -base64 32
```

Copie o resultado e guarde.

---

## ☁️ Passo 3: Deploy na Vercel

### 3.1. Importar Projeto

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte sua conta do GitHub
3. Selecione o repositório `Sistema-de-Eventos-Materno`
4. Clique em **Import**

### 3.2. Configurar Build

A Vercel detectará automaticamente Next.js. Confirme:

**Framework Preset:** Next.js
**Build Command:** `npm run build` (ou deixe padrão)
**Output Directory:** `.next` (padrão)
**Install Command:** `npm install` (padrão)

### 3.3. Configurar Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# NextAuth
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=cole-a-chave-gerada-no-passo-2

# App
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

**⚠️ IMPORTANTE:**
- Use a Connection String do seu banco PostgreSQL
- Adicione `?sslmode=require` no final da DATABASE_URL
- Para Neon, use a string de "Pooled connection"

### 3.4. Deploy

1. Clique em **Deploy**
2. Aguarde o build (2-5 minutos)
3. ✅ Deploy concluído!

---

## 🗃️ Passo 4: Configurar Banco de Dados (Primeira Vez)

Após o primeiro deploy, você precisa rodar as migrations:

### Via Vercel CLI (Recomendado)

1. Instale a Vercel CLI:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Link ao projeto:
```bash
vercel link
```

4. Baixe as variáveis de ambiente:
```bash
vercel env pull .env.local
```

5. Execute as migrations:
```bash
npx prisma db push
```

6. Popular com dados iniciais (opcional):
```bash
npx prisma db seed
```

### Via Prisma Studio (Alternativa)

1. Acesse o Prisma Studio localmente:
```bash
npx prisma studio
```

2. Configure a `DATABASE_URL` local para apontar para o banco de produção
3. Crie manualmente o usuário admin inicial

---

## 📧 Passo 5: Configurar Email (Opcional)

### Usando Resend (Recomendado)

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta
3. Gere uma API Key
4. Adicione nas variáveis de ambiente da Vercel:

```env
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EMAIL_FROM=ninma Hub <noreply@seudominio.com>
```

### Outras opções:
- SendGrid
- Mailgun
- Amazon SES

---

## 📦 Passo 6: Configurar Storage (Opcional)

### Vercel Blob Storage

1. No dashboard da Vercel, vá em **Storage**
2. Crie um **Blob Store**
3. Conecte ao projeto
4. A variável `BLOB_READ_WRITE_TOKEN` será adicionada automaticamente

### Configurar no código

No arquivo `src/app/api/submissions/upload/route.ts`, descomente:

```typescript
// Descomente para usar Vercel Blob
// import { put } from '@vercel/blob'
// const blob = await put(fileName, file, { access: 'public' })
// const fileUrl = blob.url
```

---

## 🌐 Passo 7: Configurar Domínio Personalizado (Opcional)

1. No dashboard da Vercel, vá em **Settings → Domains**
2. Adicione seu domínio (ex: `eventos.ninmahub.com`)
3. Configure os DNS conforme instruções
4. Atualize `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` nas variáveis de ambiente

---

## 🔄 Passo 8: Deploy Contínuo

Após a configuração inicial, todo `git push` para a branch principal fará deploy automático!

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

A Vercel:
1. Detecta o push
2. Faz build automático
3. Deploy em produção
4. Notifica via email/Slack (se configurado)

---

## ✅ Checklist Final

- [ ] Deploy realizado com sucesso
- [ ] DATABASE_URL configurada corretamente
- [ ] NEXTAUTH_SECRET gerado e configurado
- [ ] Migrations executadas (`npx prisma db push`)
- [ ] Usuário admin criado
- [ ] Login funcionando
- [ ] Testar criação de evento
- [ ] Testar inscrição em evento
- [ ] Testar upload de arquivo
- [ ] Testar geração de certificado
- [ ] Email configurado (se aplicável)
- [ ] Domínio personalizado configurado (se aplicável)

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
- Verifique se a `DATABASE_URL` está correta
- Adicione `?sslmode=require` no final
- Para Neon, use "Pooled connection" string
- Verifique se o IP da Vercel está na whitelist (Neon/Supabase não requerem)

### Erro: "Prisma Client not generated"

**Solução:**
- Adicione script de build em `package.json`:
```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### Erro: "Module not found" após deploy

**Solução:**
- Verifique se todas as dependências estão em `dependencies` (não `devDependencies`)
- Execute `npm install` e faça commit do `package-lock.json`

### Upload de arquivo não funciona

**Solução:**
- Vercel Serverless Functions têm limite de 4.5MB para body
- Use Vercel Blob Storage para arquivos maiores
- Ou configure um storage externo (S3, Cloudinary)

### Performance lenta

**Solução:**
- Verifique region do banco de dados (prefira `us-east-1` ou `sa-east-1`)
- Configure Prisma connection pooling
- Use `revalidate` em páginas estáticas
- Adicione indexes no banco de dados

---

## 📊 Monitoramento

### Vercel Analytics

Acesse **Analytics** no dashboard para ver:
- Número de visitantes
- Performance (Core Web Vitals)
- Erros de runtime

### Logs

Acesse **Deployments → [seu deploy] → Function Logs** para ver:
- Erros de API
- Queries lentas
- Requests

---

## 🔒 Segurança em Produção

### Checklist de Segurança

- [ ] `NEXTAUTH_SECRET` é forte (32+ caracteres)
- [ ] Variáveis de ambiente não estão no código
- [ ] `.env` está no `.gitignore`
- [ ] DATABASE_URL usa SSL (`?sslmode=require`)
- [ ] CORS configurado corretamente
- [ ] Rate limiting implementado (opcional)
- [ ] Backup automático do banco configurado

---

## 📚 Recursos Adicionais

- [Documentação Vercel](https://vercel.com/docs)
- [Prisma com Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth com Vercel](https://next-auth.js.org/deployment)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)

---

## 🎉 Pronto!

Seu sistema ninma hub está no ar! 🚀

**URL de acesso:** https://seu-projeto.vercel.app

**Próximos passos:**
1. Criar eventos
2. Convidar usuários
3. Testar todos os fluxos
4. Configurar backups
5. Monitorar performance

---

**Desenvolvido por Oryum Tech**
**Qualquer dúvida: contato@oryumtech.com**
