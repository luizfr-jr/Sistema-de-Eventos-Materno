# 🚀 Guia de Deploy - ninma hub

Este guia cobre todas as opções de deploy para o ninma hub.

## 📋 Pré-requisitos para Deploy

- [ ] Código commitado no Git
- [ ] Banco PostgreSQL configurado
- [ ] Variáveis de ambiente definidas
- [ ] Build testado localmente

## 🌟 Opção 1: Deploy na Vercel (Recomendado)

A Vercel é a plataforma recomendada pois oferece:
- ✅ Deploy automático do Next.js
- ✅ SSL gratuito
- ✅ CDN global
- ✅ Preview deployments
- ✅ Integração com GitHub

### Passo a Passo

#### 1. Preparar o Repositório

```bash
# Inicializar git (se ainda não estiver)
git init
git add .
git commit -m "Initial commit"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/ninma-hub.git
git branch -M main
git push -u origin main
```

#### 2. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=seu-secret-aqui
```

5. Clique em "Deploy"

#### 3. Configurar o Banco de Dados

Depois do primeiro deploy:

```bash
# Conectar ao projeto Vercel
npx vercel link

# Executar migrations
npx vercel env pull .env.local
npm run db:push

# Executar seed (opcional)
npm run db:seed
```

## 🐘 Configuração do Banco de Dados

### Opção A: Neon (PostgreSQL Serverless)

1. Acesse [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string
4. Cole na variável `DATABASE_URL`

**Vantagens:**
- ✅ Gratuito até 10GB
- ✅ Serverless (escala automaticamente)
- ✅ Baixa latência

### Opção B: Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > Database
4. Copie a Connection String (modo "Transaction")
5. Cole na variável `DATABASE_URL`

**Vantagens:**
- ✅ Gratuito até 500MB
- ✅ Interface visual para o banco
- ✅ Backup automático

### Opção C: Railway

1. Acesse [railway.app](https://railway.app)
2. Crie um novo projeto PostgreSQL
3. Copie a connection string
4. Cole na variável `DATABASE_URL`

**Vantagens:**
- ✅ $5 de crédito mensal grátis
- ✅ Deploy completo (app + DB)

## 🛠️ Opção 2: Deploy no Railway

### Passo a Passo

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha seu repositório
5. Adicione PostgreSQL:
   - Clique em "+ New"
   - Selecione "Database" > "PostgreSQL"
6. Configure variáveis de ambiente no painel
7. Deploy automático!

### Vantagens
- ✅ Tudo em um só lugar
- ✅ Logs em tempo real
- ✅ Fácil escalabilidade

## 🌊 Opção 3: Deploy no Render

### Passo a Passo

1. Acesse [render.com](https://render.com)
2. Conecte seu GitHub
3. Crie um "New Web Service"
4. Configure:
   - Build Command: `npm install && npm run build && npm run db:push`
   - Start Command: `npm start`
5. Adicione PostgreSQL:
   - Dashboard > "New" > "PostgreSQL"
6. Configure variáveis de ambiente
7. Deploy!

## ⚙️ Variáveis de Ambiente de Produção

```env
# Database
DATABASE_URL="sua-connection-string-aqui"

# NextAuth
NEXTAUTH_URL="https://seu-dominio.com"
NEXTAUTH_SECRET="use-um-secret-forte-aqui"

# Email (Opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASSWORD="sua-senha-de-app"
SMTP_FROM="ninma hub <noreply@ninmahub.com>"

# App
APP_NAME="ninma hub"
APP_URL="https://seu-dominio.com"
```

### Como gerar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## 📊 Monitoramento Pós-Deploy

### Verificações Essenciais

- [ ] Site carrega corretamente
- [ ] Login funciona
- [ ] Criação de usuário funciona
- [ ] Dashboard carrega
- [ ] Eventos são listados
- [ ] Inscrição em eventos funciona

### Logs

**Vercel:**
```bash
npx vercel logs
```

**Railway:**
- Acesse o painel e veja logs em tempo real

**Render:**
- Vá em "Logs" no menu lateral

## 🔒 Segurança em Produção

### Checklist de Segurança

- [ ] HTTPS habilitado (automático na Vercel/Railway/Render)
- [ ] Senhas hasheadas (bcrypt ✓)
- [ ] Variáveis sensíveis em .env
- [ ] CORS configurado corretamente
- [ ] Rate limiting (considere adicionar)
- [ ] SQL injection protection (Prisma ✓)

### Recomendações

1. **Use secrets fortes:**
   ```bash
   # Gere com:
   openssl rand -hex 32
   ```

2. **Não commite .env:**
   - Sempre use .env.example
   - Adicione .env no .gitignore

3. **Configure CORS:**
   - Restrinja origens permitidas
   - Use apenas seu domínio

## 🔄 CI/CD

### Deploy Automático (Vercel)

Já configurado! Qualquer push para `main` faz deploy automático.

### Preview Deployments

Cada Pull Request gera um preview automático na Vercel.

## 📈 Escalabilidade

### Otimizações Recomendadas

1. **Cache de Queries:**
   ```typescript
   // Use revalidate no fetch
   fetch(url, { next: { revalidate: 3600 } })
   ```

2. **Imagens Otimizadas:**
   ```typescript
   import Image from 'next/image'
   // Next.js otimiza automaticamente
   ```

3. **Database Connection Pooling:**
   - Já configurado no Prisma
   - Use PgBouncer para mais conexões

## 🆘 Troubleshooting

### Erro: "Failed to connect to database"

**Solução:**
- Verifique DATABASE_URL
- Teste conexão com `npm run db:studio`
- Verifique firewall do banco

### Erro: "NEXTAUTH_SECRET not set"

**Solução:**
```bash
openssl rand -base64 32
# Adicione o resultado em NEXTAUTH_SECRET
```

### Build Failed

**Solução:**
```bash
# Teste local
npm run build

# Verifique erros TypeScript
npm run lint
```

## 📞 Suporte

Para dúvidas sobre deploy:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Site acessível via HTTPS
- [ ] Banco de dados populado com seed
- [ ] Todas as páginas carregam
- [ ] Autenticação funcionando
- [ ] CRUD de eventos funcional
- [ ] Certificados podem ser emitidos
- [ ] Backup do banco configurado
- [ ] Domínio customizado (opcional)
- [ ] Analytics configurado (opcional)

---

🎉 **Parabéns! Seu ninma hub está no ar!**
