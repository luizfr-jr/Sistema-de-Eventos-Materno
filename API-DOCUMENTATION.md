# 📚 Documentação da API - ninma hub

> Sistema completo de gestão de eventos acadêmicos

---

## 🔐 Autenticação

Todas as rotas protegidas requerem autenticação via NextAuth.js com JWT.

### Endpoints de Autenticação

#### POST `/api/auth/signin`
Login de usuário

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "clx...",
    "name": "João Silva",
    "email": "usuario@exemplo.com",
    "role": "PARTICIPANT"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST `/api/auth/register`
Criar nova conta

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123",
  "confirmPassword": "senha123",
  "institution": "Universidade Franciscana",
  "course": "Enfermagem",
  "phone": "(55) 99999-9999"
}
```

**Response:** `201 Created`
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": "clx...",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "role": "PARTICIPANT"
  }
}
```

---

## 📅 EVENTOS

### GET `/api/events`
Listar eventos com filtros

**Query Parameters:**
- `status` - Filtrar por status (DRAFT, OPEN, CLOSED, etc.)
- `type` - Filtrar por tipo (CONFERENCE, WORKSHOP, etc.)
- `search` - Busca por título ou descrição
- `isOnline` - Filtrar eventos online (true/false)
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 10)

**Response:** `200 OK`
```json
{
  "events": [
    {
      "id": "clx...",
      "title": "I Simpósio de Saúde Materno-Infantil",
      "slug": "i-simposio-saude-materno-infantil",
      "description": "...",
      "type": "SYMPOSIUM",
      "status": "OPEN",
      "startDate": "2025-12-15T09:00:00.000Z",
      "endDate": "2025-12-17T18:00:00.000Z",
      "location": "Auditório Central - UFN",
      "isOnline": false,
      "capacity": 200,
      "_count": {
        "registrations": 45
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

### POST `/api/events`
Criar novo evento

**Permissions:** ADMIN, COORDINATOR

**Body:**
```json
{
  "title": "Workshop de Aleitamento Materno",
  "description": "Workshop prático sobre técnicas...",
  "type": "WORKSHOP",
  "startDate": "2025-12-20T14:00:00.000Z",
  "endDate": "2025-12-20T18:00:00.000Z",
  "location": "Lab de Enfermagem",
  "isOnline": false,
  "capacity": 40,
  "allowRegistrations": true,
  "registrationEnd": "2025-12-18T23:59:59.000Z",
  "issueCertificates": true,
  "workload": 4
}
```

**Response:** `201 Created`

### GET `/api/events/[id]`
Obter detalhes de um evento

**Response:** `200 OK`
```json
{
  "id": "clx...",
  "title": "Workshop de Aleitamento Materno",
  "slug": "workshop-aleitamento-materno",
  "description": "...",
  "startDate": "2025-12-20T14:00:00.000Z",
  "location": "Lab de Enfermagem",
  "capacity": 40,
  "createdBy": {
    "id": "clx...",
    "name": "Dr. Carlos Silva",
    "email": "coordenador@ninmahub.com"
  },
  "registrations": [...],
  "_count": {
    "registrations": 15,
    "submissions": 0,
    "certificates": 0
  }
}
```

### PATCH `/api/events/[id]`
Atualizar evento

**Permissions:** ADMIN, COORDINATOR (criador)

**Body:** (campos a atualizar)
```json
{
  "status": "OPEN",
  "capacity": 50
}
```

**Response:** `200 OK`

### DELETE `/api/events/[id]`
Deletar evento

**Permissions:** ADMIN, COORDINATOR (criador)

**Response:** `200 OK`

### POST `/api/events/[id]/register`
Inscrever-se em um evento

**Body:**
```json
{
  "notes": "Observações opcionais",
  "dietaryRestrictions": "Vegetariano"
}
```

**Response:** `201 Created`
```json
{
  "message": "Inscrição realizada com sucesso",
  "registration": {
    "id": "clx...",
    "eventId": "clx...",
    "userId": "clx...",
    "status": "CONFIRMED",
    "registeredAt": "2025-11-18T10:00:00.000Z"
  }
}
```

### GET `/api/events/[id]/registrations`
Listar inscrições de um evento

**Permissions:** ADMIN, COORDINATOR (criador)

**Response:** `200 OK`

---

## 📄 TRABALHOS ACADÊMICOS

### GET `/api/submissions`
Listar trabalhos

**Filtros por role:**
- PARTICIPANT: Vê apenas seus próprios trabalhos
- REVIEWER: Vê trabalhos para avaliar
- ADMIN/COORDINATOR: Vê todos

**Response:** `200 OK`
```json
{
  "submissions": [
    {
      "id": "clx...",
      "title": "Análise de Práticas de Aleitamento Materno",
      "abstract": "Este estudo analisa...",
      "status": "UNDER_REVIEW",
      "keywords": ["aleitamento", "saúde pública"],
      "authors": [
        {
          "name": "João Silva",
          "email": "joao@exemplo.com",
          "institution": "UFN"
        }
      ],
      "fileName": "trabalho.pdf",
      "fileSize": 1024000,
      "event": {
        "title": "I Simpósio..."
      },
      "reviews": [...]
    }
  ]
}
```

### POST `/api/submissions`
Enviar novo trabalho

**Body:**
```json
{
  "eventId": "clx...",
  "title": "Título do Trabalho",
  "abstract": "Resumo com no mínimo 50 caracteres...",
  "keywords": ["palavra1", "palavra2", "palavra3"],
  "authors": [
    {
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "institution": "UFN"
    }
  ],
  "fileUrl": "/uploads/submissions/trabalho-123456.pdf",
  "fileName": "trabalho.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf"
}
```

**Response:** `201 Created`

### POST `/api/submissions/upload`
Upload de arquivo

**Content-Type:** `multipart/form-data`

**Body:**
- `file` - Arquivo PDF, DOC ou DOCX (máx 10MB)

**Response:** `200 OK`
```json
{
  "url": "/uploads/submissions/trabalho-123456.pdf",
  "fileName": "trabalho.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf"
}
```

### GET `/api/submissions/[id]`
Obter detalhes do trabalho

**Response:** `200 OK`

### PATCH `/api/submissions/[id]`
Atualizar trabalho

**Permissions:** Autor (status DRAFT ou REVISION)

**Response:** `200 OK`

### DELETE `/api/submissions/[id]`
Deletar trabalho

**Permissions:** Autor (status DRAFT apenas)

**Response:** `200 OK`

### POST `/api/submissions/[id]/review`
Avaliar trabalho

**Permissions:** REVIEWER, COORDINATOR, ADMIN

**Body:**
```json
{
  "status": "APPROVED",
  "rating": 5,
  "originality": 5,
  "relevance": 5,
  "methodology": 4,
  "clarity": 5,
  "comments": "Excelente trabalho com metodologia bem estruturada..."
}
```

**Response:** `201 Created`

---

## ✓ PRESENÇAS

### POST `/api/attendances/checkin`
Registrar check-in

**Body:**
```json
{
  "registrationId": "clx...",
  "method": "QR_CODE"
}
```

**Response:** `200 OK`
```json
{
  "message": "Check-in realizado com sucesso",
  "attendance": {
    "id": "clx...",
    "checkinAt": "2025-12-15T09:15:00.000Z",
    "method": "QR_CODE"
  }
}
```

### POST `/api/attendances/checkout`
Registrar check-out

**Body:**
```json
{
  "attendanceId": "clx..."
}
```

**Response:** `200 OK`

### POST `/api/attendances/manual`
Check-in manual em lote

**Permissions:** ADMIN, COORDINATOR

**Body:**
```json
{
  "eventId": "clx...",
  "registrationIds": ["clx1...", "clx2...", "clx3..."],
  "notes": "Check-in manual realizado pelo coordenador"
}
```

**Response:** `200 OK`
```json
{
  "message": "Check-in realizado para 3 participantes",
  "success": 3,
  "failed": 0
}
```

### POST `/api/attendances/qrcode`
Gerar ou processar QR code

**Action: generate**
```json
{
  "action": "generate",
  "registrationId": "clx..."
}
```

**Response:** QR code em base64

**Action: checkin**
```json
{
  "action": "checkin",
  "qrData": "encrypted-data-from-qr-code"
}
```

**Response:** Check-in confirmado

### GET `/api/events/[id]/attendances`
Listar presenças do evento

**Permissions:** ADMIN, COORDINATOR

**Query Parameters:**
- `search` - Buscar por nome ou email
- `method` - Filtrar por método (QR_CODE, MANUAL, AUTOMATIC)

**Response:** `200 OK`

### GET `/api/events/[id]/attendances/stats`
Estatísticas de presença

**Response:** `200 OK`
```json
{
  "total": 100,
  "present": 85,
  "absent": 15,
  "percentage": 85,
  "byMethod": {
    "QR_CODE": 70,
    "MANUAL": 10,
    "AUTOMATIC": 5
  }
}
```

### GET `/api/events/[id]/attendances/export`
Exportar lista de presenças (CSV)

**Response:** Arquivo CSV

---

## 🎓 CERTIFICADOS

### GET `/api/certificates`
Listar certificados

**Filtros por role:**
- PARTICIPANT: Vê apenas seus próprios
- ADMIN/COORDINATOR: Vê todos

**Query Parameters:**
- `eventId` - Filtrar por evento
- `userId` - Filtrar por usuário
- `page`, `limit` - Paginação

**Response:** `200 OK`
```json
{
  "certificates": [
    {
      "id": "clx...",
      "verificationCode": "NINMA-20251218-ABCDE",
      "workload": 16,
      "role": "Participante",
      "issuedAt": "2025-12-18T10:00:00.000Z",
      "validUntil": "2030-12-18T10:00:00.000Z",
      "event": {
        "title": "I Simpósio..."
      },
      "user": {
        "name": "João Silva"
      }
    }
  ]
}
```

### POST `/api/certificates/generate`
Gerar certificados em lote

**Permissions:** ADMIN, COORDINATOR

**Body:**
```json
{
  "eventId": "clx...",
  "role": "Participante"
}
```

**Response:** `200 OK`
```json
{
  "message": "45 certificados gerados com sucesso",
  "generated": 45,
  "failed": 0
}
```

### GET `/api/certificates/[id]`
Obter detalhes do certificado

**Response:** `200 OK`

### GET `/api/certificates/[id]/download`
Download do certificado em PDF

**Response:** PDF file

### GET `/api/certificates/verify/[code]`
Verificar autenticidade do certificado

**Public Route** (sem autenticação)

**Response:** `200 OK`
```json
{
  "valid": true,
  "certificate": {
    "verificationCode": "NINMA-20251218-ABCDE",
    "participant": "João Silva",
    "event": "I Simpósio de Saúde Materno-Infantil",
    "workload": 16,
    "issuedAt": "2025-12-18T10:00:00.000Z",
    "validUntil": "2030-12-18T10:00:00.000Z"
  }
}
```

---

## 🔒 Códigos de Status HTTP

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `409 Conflict` - Conflito (ex: duplicação)
- `500 Internal Server Error` - Erro no servidor

## 🛡️ Roles e Permissões

### ADMIN
- Acesso total ao sistema
- Gerenciar todos os eventos, usuários, trabalhos
- Gerar certificados
- Controlar presenças

### COORDINATOR
- Criar e gerenciar seus próprios eventos
- Aprovar inscrições
- Controlar presenças em seus eventos
- Gerar certificados para seus eventos
- Avaliar trabalhos

### REVIEWER
- Avaliar trabalhos acadêmicos
- Visualizar trabalhos atribuídos

### PARTICIPANT
- Visualizar eventos
- Inscrever-se em eventos
- Enviar trabalhos acadêmicos
- Visualizar seus certificados

---

## 📊 Tipos de Enums

### EventStatus
- `DRAFT` - Rascunho
- `OPEN` - Aberto para inscrições
- `CLOSED` - Encerrado para inscrições
- `IN_PROGRESS` - Em andamento
- `COMPLETED` - Concluído
- `CANCELLED` - Cancelado

### EventType
- `CONFERENCE` - Conferência
- `WORKSHOP` - Workshop
- `SEMINAR` - Seminário
- `COURSE` - Curso
- `WEBINAR` - Webinar
- `SYMPOSIUM` - Simpósio
- `CONGRESS` - Congresso
- `OTHER` - Outro

### RegistrationStatus
- `PENDING` - Pendente de aprovação
- `CONFIRMED` - Confirmada
- `CANCELLED` - Cancelada
- `ATTENDED` - Presente
- `ABSENT` - Ausente
- `WAITLIST` - Lista de espera

### SubmissionStatus
- `DRAFT` - Rascunho
- `SUBMITTED` - Enviado
- `UNDER_REVIEW` - Em avaliação
- `APPROVED` - Aprovado
- `REJECTED` - Rejeitado
- `REVISION` - Revisão solicitada

### AttendanceMethod
- `QR_CODE` - QR Code escaneado
- `MANUAL` - Registro manual
- `AUTOMATIC` - Automático

---

**Desenvolvido por Oryum Tech para ninma hub - UFN**
