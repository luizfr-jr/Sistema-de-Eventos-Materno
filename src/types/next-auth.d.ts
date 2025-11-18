import { UserRole } from '@prisma/client'
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    role: UserRole
    institution?: string
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: UserRole
      image?: string
      institution?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    institution?: string
  }
}
