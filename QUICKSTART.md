# ⚡ Início Rápido - ninma hub

Coloque o ninma hub rodando em **5 minutos**!

## 🎯 Pré-requisitos

Certifique-se de ter instalado:
- ✅ Node.js 18 ou superior
- ✅ PostgreSQL 14 ou superior
- ✅ npm ou yarn

## 🚀 Instalação Express

### 1. Clone e Instale

```bash
# Clone o repositório
git clone <repository-url>
cd ninma-hub

# Instale as dependências
npm install
```

### 2. Configure o Banco de Dados

**Opção A: Local com Docker**
```bash
# Inicie PostgreSQL com Docker
docker run --name ninma-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ninma_hub \
  -p 5432:5432 \
  -d postgres:14

# Connection string:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ninma_hub"
```

**Opção B: Cloud (Neon.tech - GRÁTIS)**
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta
3. Crie um novo projeto
4. Copie a connection string

### 3. Configure Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env e adicione:
# DATABASE_URL="sua-connection-string-aqui"
# NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### 4. Inicialize o Banco

```bash
# Criar as tabelas
npm run db:push

# Popular com dados de exemplo
npm run db:seed
```

### 5. Inicie o Servidor

```bash
npm run dev
```

🎉 **Pronto!** Acesse [http://localhost:3000](http://localhost:3000)

## 👤 Faça Login

Use uma das contas de teste:

```
📧 admin@ninmahub.com
🔑 senha123

📧 coordenador@ninmahub.com
🔑 senha123

📧 joao@exemplo.com
🔑 senha123
```

## ✅ Verificação

Teste se tudo está funcionando:

- [ ] Página inicial carrega
- [ ] Login funciona
- [ ] Dashboard aparece
- [ ] Eventos são listados
- [ ] Consegue criar conta nova

## 🐛 Problemas?

### Erro: "Can't connect to database"

```bash
# Verifique se o PostgreSQL está rodando
docker ps  # ou
pg_isready

# Teste a conexão
npm run db:studio
```

### Erro: "Port 3000 already in use"

```bash
# Use outra porta
PORT=3001 npm run dev
```

### Erro: "Module not found"

```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

## 📝 Próximos Passos

1. **Explore o sistema:**
   - Crie um evento
   - Faça uma inscrição
   - Emita um certificado

2. **Customize:**
   - Edite cores em `tailwind.config.ts`
   - Modifique logo em `src/components/ui/NinmaLogo.tsx`
   - Ajuste textos conforme sua instituição

3. **Aprenda mais:**
   - 📖 Leia o [MANUAL.md](./MANUAL.md)
   - 🛠️ Veja [TECHNICAL.md](./TECHNICAL.md)
   - 🚀 Prepare deploy com [DEPLOY.md](./DEPLOY.md)

## 🎨 Personalização Rápida

### Alterar Cores

```typescript
// tailwind.config.ts
colors: {
  ninma: {
    purple: '#SUA_COR',  // Altere aqui
    // ...
  }
}
```

### Alterar Nome da Instituição

```typescript
// src/components/ui/NinmaLogo.tsx
<span>SEU NOME</span>
```

### Alterar E-mails

```typescript
// .env
SMTP_FROM="Seu Nome <email@seudominio.com>"
```

## 📚 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor dev
npm run build            # Build de produção
npm run start            # Iniciar produção

# Banco de Dados
npm run db:push          # Sync schema
npm run db:seed          # Popular dados
npm run db:studio        # Abrir Prisma Studio

# Qualidade
npm run lint             # Verificar código
npm run format           # Formatar código
```

## 🆘 Ajuda

**Documentação:**
- [README.md](./README.md) - Visão geral
- [MANUAL.md](./MANUAL.md) - Manual de uso
- [TECHNICAL.md](./TECHNICAL.md) - Documentação técnica
- [DEPLOY.md](./DEPLOY.md) - Guia de deploy

**Suporte:**
- 📧 Email: suporte@ninmahub.com
- 💬 Issues: GitHub Issues

---

💡 **Dica:** Mantenha este guia à mão para referência rápida!

**Desenvolvido por Oryum Tech** 🚀
