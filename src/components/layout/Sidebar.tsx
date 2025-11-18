'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CheckSquare,
  Award,
  Users,
  Settings,
  LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/dashboard/events',
    label: 'Eventos',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    href: '/dashboard/submissions',
    label: 'Trabalhos',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    href: '/dashboard/attendances',
    label: 'Presenças',
    icon: <CheckSquare className="h-5 w-5" />,
    roles: ['ADMIN', 'COORDINATOR'],
  },
  {
    href: '/dashboard/certificates',
    label: 'Certificados',
    icon: <Award className="h-5 w-5" />,
  },
  {
    href: '/dashboard/users',
    label: 'Usuários',
    icon: <Users className="h-5 w-5" />,
    roles: ['ADMIN'],
  },
]

interface SidebarProps {
  userRole?: string
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole || '')
  )

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ninma-purple text-xl text-white">
            🎨
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-gray-900">
              ninma hub
            </h1>
            <p className="text-xs text-gray-500">Gestão de Eventos</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-ninma-purple text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 space-y-2">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
