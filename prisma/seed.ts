import { PrismaClient, UserRole, EventStatus, EventType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes (em desenvolvimento)
  console.log('🧹 Limpando dados existentes...')
  await prisma.auditLog.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.review.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.registration.deleteMany()
  await prisma.eventSchedule.deleteMany()
  await prisma.event.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Hash da senha padrão
  const hashedPassword = await bcrypt.hash('senha123', 12)

  // ==========================================
  // CRIAR USUÁRIOS
  // ==========================================
  console.log('👥 Criando usuários...')

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador do Sistema',
      email: 'admin@ninmahub.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      institution: 'Universidade Franciscana - UFN',
      emailVerified: new Date(),
    },
  })

  const coordinator = await prisma.user.create({
    data: {
      name: 'Dr. Carlos Silva',
      email: 'coordenador@ninmahub.com',
      password: hashedPassword,
      role: UserRole.COORDINATOR,
      institution: 'Universidade Franciscana - UFN',
      course: 'Medicina',
      phone: '(55) 99999-1111',
      bio: 'Coordenador do ninma hub - Núcleo de Inovação Materno Infantil',
      emailVerified: new Date(),
    },
  })

  const reviewer = await prisma.user.create({
    data: {
      name: 'Dra. Maria Santos',
      email: 'avaliadora@ninmahub.com',
      password: hashedPassword,
      role: UserRole.REVIEWER,
      institution: 'Universidade Franciscana - UFN',
      course: 'Enfermagem',
      bio: 'Avaliadora de trabalhos acadêmicos na área materno-infantil',
      emailVerified: new Date(),
    },
  })

  const participant1 = await prisma.user.create({
    data: {
      name: 'João Pedro Oliveira',
      email: 'joao@exemplo.com',
      password: hashedPassword,
      role: UserRole.PARTICIPANT,
      institution: 'Universidade Franciscana - UFN',
      course: 'Enfermagem',
      phone: '(55) 99999-2222',
      emailVerified: new Date(),
    },
  })

  const participant2 = await prisma.user.create({
    data: {
      name: 'Ana Paula Costa',
      email: 'ana@exemplo.com',
      password: hashedPassword,
      role: UserRole.PARTICIPANT,
      institution: 'Universidade Federal de Santa Maria',
      course: 'Medicina',
      phone: '(55) 99999-3333',
      emailVerified: new Date(),
    },
  })

  const participant3 = await prisma.user.create({
    data: {
      name: 'Lucas Martins',
      email: 'lucas@exemplo.com',
      password: hashedPassword,
      role: UserRole.PARTICIPANT,
      institution: 'Universidade Franciscana - UFN',
      course: 'Fisioterapia',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Usuários criados com sucesso!')

  // ==========================================
  // CRIAR EVENTOS
  // ==========================================
  console.log('📅 Criando eventos...')

  const now = new Date()
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + 30)

  const event1 = await prisma.event.create({
    data: {
      title: 'I Simpósio de Saúde Materno-Infantil',
      slug: 'i-simposio-saude-materno-infantil',
      description: `O I Simpósio de Saúde Materno-Infantil é um evento científico que visa promover a discussão de temas relevantes na área da saúde materno-infantil, reunindo profissionais, pesquisadores e estudantes interessados em aprofundar seus conhecimentos.

O evento contará com palestras, mesas redondas e apresentações de trabalhos científicos sobre temas como gestação de alto risco, aleitamento materno, cuidados neonatais, entre outros.`,
      shortDesc: 'Evento científico sobre saúde materno-infantil com palestras e trabalhos',
      type: EventType.SYMPOSIUM,
      status: EventStatus.OPEN,
      startDate: futureDate,
      endDate: new Date(futureDate.getTime() + 2 * 24 * 60 * 60 * 1000), // +2 dias
      location: 'Auditório Central - UFN',
      address: 'Rua dos Andradas, 1614',
      city: 'Santa Maria',
      state: 'RS',
      isOnline: false,
      capacity: 200,
      allowRegistrations: true,
      registrationStart: now,
      registrationEnd: new Date(futureDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 dias antes
      allowSubmissions: true,
      submissionStart: now,
      submissionEnd: new Date(futureDate.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 dias antes
      submissionGuidelines: 'Os trabalhos devem ser enviados em formato PDF, com no máximo 5 páginas.',
      issueCertificates: true,
      workload: 16,
      tags: ['saúde', 'materno-infantil', 'simpósio'],
      keywords: ['gestação', 'neonatologia', 'pediatria'],
      createdById: coordinator.id,
      publishedAt: now,
    },
  })

  const event2 = await prisma.event.create({
    data: {
      title: 'Workshop de Aleitamento Materno',
      slug: 'workshop-aleitamento-materno',
      description: 'Workshop prático sobre técnicas de aleitamento materno, manejo de dificuldades e orientação às mães.',
      shortDesc: 'Workshop prático sobre aleitamento materno',
      type: EventType.WORKSHOP,
      status: EventStatus.OPEN,
      startDate: new Date(futureDate.getTime() + 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(futureDate.getTime() + 15 * 24 * 60 * 60 * 1000),
      location: 'Laboratório de Enfermagem - UFN',
      city: 'Santa Maria',
      state: 'RS',
      isOnline: false,
      capacity: 40,
      allowRegistrations: true,
      registrationStart: now,
      registrationEnd: new Date(futureDate.getTime() + 13 * 24 * 60 * 60 * 1000),
      issueCertificates: true,
      workload: 8,
      tags: ['aleitamento', 'workshop', 'prático'],
      keywords: ['amamentação', 'lactação'],
      createdById: coordinator.id,
      publishedAt: now,
    },
  })

  const event3 = await prisma.event.create({
    data: {
      title: 'Webinar: Cuidados Neonatais na UTI',
      slug: 'webinar-cuidados-neonatais-uti',
      description: 'Webinar online sobre cuidados especializados para recém-nascidos em unidades de terapia intensiva.',
      shortDesc: 'Webinar sobre cuidados neonatais',
      type: EventType.WEBINAR,
      status: EventStatus.OPEN,
      startDate: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      location: 'Online',
      isOnline: true,
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      capacity: 500,
      allowRegistrations: true,
      registrationStart: now,
      registrationEnd: new Date(futureDate.getTime() + 6 * 24 * 60 * 60 * 1000),
      issueCertificates: true,
      workload: 4,
      tags: ['webinar', 'online', 'neonatologia'],
      keywords: ['UTI neonatal', 'recém-nascido'],
      createdById: coordinator.id,
      publishedAt: now,
    },
  })

  const event4 = await prisma.event.create({
    data: {
      title: 'Congresso de Inovação em Saúde Materno-Infantil',
      slug: 'congresso-inovacao-saude',
      description: 'Grande congresso sobre inovações tecnológicas e metodológicas na área de saúde materno-infantil.',
      shortDesc: 'Congresso sobre inovação em saúde materno-infantil',
      type: EventType.CONGRESS,
      status: EventStatus.DRAFT,
      startDate: new Date(futureDate.getTime() + 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(futureDate.getTime() + 63 * 24 * 60 * 60 * 1000),
      location: 'Centro de Convenções',
      city: 'Porto Alegre',
      state: 'RS',
      isOnline: false,
      capacity: 1000,
      allowRegistrations: false,
      allowSubmissions: true,
      submissionStart: now,
      submissionEnd: new Date(futureDate.getTime() + 45 * 24 * 60 * 60 * 1000),
      issueCertificates: true,
      workload: 32,
      tags: ['congresso', 'inovação', 'tecnologia'],
      keywords: ['inovação', 'pesquisa', 'tecnologia'],
      createdById: admin.id,
    },
  })

  console.log('✅ Eventos criados com sucesso!')

  // ==========================================
  // CRIAR PROGRAMAÇÃO DE EVENTOS
  // ==========================================
  console.log('📋 Criando programação...')

  await prisma.eventSchedule.createMany({
    data: [
      {
        eventId: event1.id,
        title: 'Abertura Oficial',
        speaker: 'Reitor da UFN',
        startTime: futureDate,
        endTime: new Date(futureDate.getTime() + 60 * 60 * 1000), // +1h
        location: 'Auditório Central',
        order: 1,
      },
      {
        eventId: event1.id,
        title: 'Palestra: Gestação de Alto Risco',
        speaker: 'Dra. Maria Santos',
        startTime: new Date(futureDate.getTime() + 90 * 60 * 1000),
        endTime: new Date(futureDate.getTime() + 150 * 60 * 1000),
        location: 'Auditório Central',
        order: 2,
      },
    ],
  })

  console.log('✅ Programação criada!')

  // ==========================================
  // CRIAR INSCRIÇÕES
  // ==========================================
  console.log('✍️ Criando inscrições...')

  const reg1 = await prisma.registration.create({
    data: {
      eventId: event1.id,
      userId: participant1.id,
      status: 'CONFIRMED',
      confirmed: true,
      confirmedAt: now,
    },
  })

  const reg2 = await prisma.registration.create({
    data: {
      eventId: event1.id,
      userId: participant2.id,
      status: 'CONFIRMED',
      confirmed: true,
      confirmedAt: now,
    },
  })

  const reg3 = await prisma.registration.create({
    data: {
      eventId: event2.id,
      userId: participant1.id,
      status: 'PENDING',
    },
  })

  await prisma.registration.create({
    data: {
      eventId: event3.id,
      userId: participant3.id,
      status: 'CONFIRMED',
      confirmed: true,
      confirmedAt: now,
    },
  })

  console.log('✅ Inscrições criadas!')

  // ==========================================
  // CRIAR TRABALHOS ACADÊMICOS
  // ==========================================
  console.log('📄 Criando trabalhos acadêmicos...')

  const submission1 = await prisma.submission.create({
    data: {
      eventId: event1.id,
      userId: participant1.id,
      title: 'Análise de Práticas de Aleitamento Materno em Maternidades Públicas',
      abstract: 'Este estudo analisa as práticas de aleitamento materno em maternidades públicas da região central do RS, identificando desafios e oportunidades de melhoria no apoio às mães.',
      keywords: ['aleitamento materno', 'saúde pública', 'maternidade'],
      authors: JSON.parse(JSON.stringify([
        { name: 'João Pedro Oliveira', email: 'joao@exemplo.com', institution: 'UFN' },
        { name: 'Prof. Dr. Carlos Silva', email: 'coordenador@ninmahub.com', institution: 'UFN' },
      ])),
      fileUrl: '/uploads/trabalho-1.pdf',
      fileName: 'trabalho-aleitamento-materno.pdf',
      fileSize: 1024000,
      mimeType: 'application/pdf',
      status: 'SUBMITTED',
    },
  })

  const submission2 = await prisma.submission.create({
    data: {
      eventId: event1.id,
      userId: participant2.id,
      title: 'Impacto da Pandemia COVID-19 na Saúde Mental Materna',
      abstract: 'Investigação sobre os impactos psicológicos da pandemia de COVID-19 em gestantes e puérperas, com foco em ansiedade e depressão pós-parto.',
      keywords: ['COVID-19', 'saúde mental', 'gestação'],
      authors: JSON.parse(JSON.stringify([
        { name: 'Ana Paula Costa', email: 'ana@exemplo.com', institution: 'UFSM' },
      ])),
      fileUrl: '/uploads/trabalho-2.pdf',
      fileName: 'trabalho-covid-saude-mental.pdf',
      fileSize: 856000,
      mimeType: 'application/pdf',
      status: 'UNDER_REVIEW',
    },
  })

  console.log('✅ Trabalhos acadêmicos criados!')

  // ==========================================
  // CRIAR AVALIAÇÕES
  // ==========================================
  console.log('⭐ Criando avaliações...')

  await prisma.review.create({
    data: {
      submissionId: submission2.id,
      reviewerId: reviewer.id,
      status: 'APPROVED',
      rating: 5,
      originality: 5,
      relevance: 5,
      methodology: 4,
      clarity: 5,
      comments: 'Excelente trabalho! Metodologia bem estruturada e resultados relevantes. Aprovado para apresentação.',
    },
  })

  console.log('✅ Avaliações criadas!')

  // ==========================================
  // CRIAR PRESENÇAS
  // ==========================================
  console.log('✓ Criando presenças...')

  await prisma.attendance.create({
    data: {
      registrationId: reg1.id,
      checkinAt: now,
      method: 'QR_CODE',
    },
  })

  console.log('✅ Presenças criadas!')

  // ==========================================
  // CRIAR CERTIFICADOS
  // ==========================================
  console.log('🎓 Criando certificados...')

  await prisma.certificate.create({
    data: {
      registrationId: reg1.id,
      eventId: event1.id,
      userId: participant1.id,
      verificationCode: `NINMA${Date.now()}`,
      workload: 16,
      role: 'Participante',
    },
  })

  console.log('✅ Certificados criados!')

  // ==========================================
  // EXIBIR RESUMO
  // ==========================================
  console.log('\n' + '='.repeat(50))
  console.log('🎉 Seed concluído com sucesso!')
  console.log('='.repeat(50))
  console.log('\n📊 RESUMO:')
  console.log('─'.repeat(50))
  console.log(`✅ Usuários criados: 6`)
  console.log(`✅ Eventos criados: 4`)
  console.log(`✅ Inscrições criadas: 4`)
  console.log(`✅ Trabalhos acadêmicos: 2`)
  console.log(`✅ Avaliações: 1`)
  console.log(`✅ Presenças: 1`)
  console.log(`✅ Certificados: 1`)
  console.log('─'.repeat(50))
  console.log('\n🔑 CREDENCIAIS DE ACESSO:')
  console.log('─'.repeat(50))
  console.log('\n👤 ADMINISTRADOR:')
  console.log('   Email: admin@ninmahub.com')
  console.log('   Senha: senha123')
  console.log('\n👤 COORDENADOR:')
  console.log('   Email: coordenador@ninmahub.com')
  console.log('   Senha: senha123')
  console.log('\n👤 AVALIADOR:')
  console.log('   Email: avaliadora@ninmahub.com')
  console.log('   Senha: senha123')
  console.log('\n👤 PARTICIPANTE:')
  console.log('   Email: joao@exemplo.com')
  console.log('   Senha: senha123')
  console.log('─'.repeat(50))
  console.log('\n💡 Próximo passo: npm run dev')
  console.log('─'.repeat(50) + '\n')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
