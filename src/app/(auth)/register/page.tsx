'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Building, GraduationCap, Phone } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    course: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      showToast.error('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      showToast.error('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta')
      }

      showToast.success('Conta criada com sucesso! Faça login para continuar.')
      router.push('/login')
    } catch (error) {
      showToast.error(
        error instanceof Error ? error.message : 'Erro ao criar conta'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ninma-purple/10 via-white to-ninma-orange/10 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-ninma-purple text-3xl text-white">
            🎨
          </div>
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            ninma hub
          </h1>
          <p className="mt-2 text-gray-600">
            Crie sua conta para acessar o sistema
          </p>
        </div>

        {/* Register Card */}
        <Card variant="elevated">
          <div className="space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Criar nova conta
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Preencha seus dados para começar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    label="Nome completo"
                    type="text"
                    id="name"
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="João Silva"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    leftIcon={<User className="h-5 w-5 text-gray-400" />}
                  />
                </div>

                <div className="md:col-span-2">
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
                </div>

                <Input
                  label="Instituição"
                  type="text"
                  id="institution"
                  name="institution"
                  placeholder="Universidade Franciscana"
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                  leftIcon={<Building className="h-5 w-5 text-gray-400" />}
                />

                <Input
                  label="Curso"
                  type="text"
                  id="course"
                  name="course"
                  placeholder="Enfermagem"
                  value={formData.course}
                  onChange={(e) =>
                    setFormData({ ...formData, course: e.target.value })
                  }
                  leftIcon={<GraduationCap className="h-5 w-5 text-gray-400" />}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Telefone"
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="(55) 99999-9999"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
                  />
                </div>

                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  required
                  placeholder="Mínimo 6 caracteres"
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

                <Input
                  label="Confirmar senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
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
                <UserPlus className="mr-2 h-5 w-5" />
                Criar conta
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Já tem uma conta?
                </span>
              </div>
            </div>

            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full">
                Fazer login
              </Button>
            </Link>
          </div>
        </Card>

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
