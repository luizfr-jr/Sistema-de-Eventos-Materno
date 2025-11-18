'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        showToast.error('Credenciais inválidas. Verifique seu email e senha.')
      } else if (result?.ok) {
        showToast.success('Login realizado com sucesso!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      showToast.error('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ninma-purple/10 via-white to-ninma-orange/10 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-ninma-purple text-3xl text-white">
            🎨
          </div>
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            ninma hub
          </h1>
          <p className="mt-2 text-gray-600">
            Sistema de Gestão de Eventos
          </p>
        </div>

        {/* Login Card */}
        <Card variant="elevated">
          <div className="space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Entrar na sua conta
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Acesse o sistema com seu email e senha
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
              />

              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Entrar
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Ainda não tem uma conta?
                </span>
              </div>
            </div>

            <Link href="/register">
              <Button variant="outline" size="lg" className="w-full">
                Criar nova conta
              </Button>
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Desenvolvido por{' '}
          <a
            href="https://oryumtech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ninma-purple hover:underline"
          >
            Oryum Tech
          </a>
        </p>
      </div>
    </div>
  )
}
