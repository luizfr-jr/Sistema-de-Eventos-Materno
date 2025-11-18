import { z } from 'zod'

// ==========================================
// VALIDAÇÕES DE AUTENTICAÇÃO
// ==========================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  institution: z.string().optional(),
  course: z.string().optional(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

// ==========================================
// VALIDAÇÕES DE EVENTOS
// ==========================================

const baseEventSchema = z.object({
  title: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  description: z.string().min(20, 'Descrição deve ter no mínimo 20 caracteres'),
  shortDesc: z.string().optional(),
  type: z.enum(['CONFERENCE', 'WORKSHOP', 'SEMINAR', 'COURSE', 'WEBINAR', 'SYMPOSIUM', 'CONGRESS', 'OTHER']),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  location: z.string().min(3, 'Local é obrigatório'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  isOnline: z.boolean().default(false),
  meetingUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  capacity: z.number().int().positive('Capacidade deve ser maior que 0').optional(),
  allowRegistrations: z.boolean().default(true),
  registrationStart: z.string().or(z.date()).optional(),
  registrationEnd: z.string().or(z.date()).optional(),
  allowSubmissions: z.boolean().default(false),
  submissionStart: z.string().or(z.date()).optional(),
  submissionEnd: z.string().or(z.date()).optional(),
  submissionGuidelines: z.string().optional(),
  issueCertificates: z.boolean().default(true),
  workload: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
})

export const eventSchema = baseEventSchema.refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return end >= start
}, {
  message: 'Data de término deve ser posterior à data de início',
  path: ['endDate'],
})

export const partialEventSchema = baseEventSchema.partial()

// ==========================================
// VALIDAÇÕES DE TRABALHOS ACADÊMICOS
// ==========================================

export const submissionSchema = z.object({
  title: z.string().min(10, 'Título deve ter no mínimo 10 caracteres'),
  abstract: z.string().min(50, 'Resumo deve ter no mínimo 50 caracteres'),
  keywords: z.array(z.string()).min(3, 'Adicione pelo menos 3 palavras-chave'),
  authors: z.array(z.object({
    name: z.string().min(3, 'Nome do autor é obrigatório'),
    email: z.string().email('Email inválido'),
    institution: z.string().optional(),
  })).min(1, 'Adicione pelo menos um autor'),
})

// ==========================================
// VALIDAÇÕES DE USUÁRIO
// ==========================================

export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().optional(),
  institution: z.string().optional(),
  course: z.string().optional(),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

// ==========================================
// VALIDAÇÕES DE INSCRIÇÃO
// ==========================================

export const registrationSchema = z.object({
  eventId: z.string().cuid('ID de evento inválido'),
  notes: z.string().max(500).optional(),
  dietaryRestrictions: z.string().max(200).optional(),
})

// ==========================================
// VALIDAÇÕES DE AVALIAÇÃO
// ==========================================

export const reviewSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REVISION']),
  rating: z.number().int().min(1).max(5).optional(),
  originality: z.number().int().min(1).max(5).optional(),
  relevance: z.number().int().min(1).max(5).optional(),
  methodology: z.number().int().min(1).max(5).optional(),
  clarity: z.number().int().min(1).max(5).optional(),
  comments: z.string().min(20, 'Comentários devem ter no mínimo 20 caracteres'),
})

// Types derivados dos schemas
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type EventInput = z.infer<typeof eventSchema>
export type SubmissionInput = z.infer<typeof submissionSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type RegistrationInput = z.infer<typeof registrationSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
