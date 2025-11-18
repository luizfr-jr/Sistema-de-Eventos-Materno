'use client'

import * as React from 'react'
import toast, { Toaster, type Toast as ToastType } from 'react-hot-toast'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  title?: string
  description?: string
  variant?: 'success' | 'error' | 'warning' | 'info'
}

// Toast Provider Component
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '0.5rem',
          padding: '16px',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: 'white',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: 'hsl(var(--destructive))',
            secondary: 'white',
          },
        },
      }}
    >
      {(t) => <ToastContent toast={t} />}
    </Toaster>
  )
}

// Toast Content Component
function ToastContent({ toast: t }: { toast: ToastType }) {
  const getIcon = () => {
    if (t.type === 'success') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
    }
    if (t.type === 'error') {
      return <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
    }
    if (t.icon) {
      return t.icon
    }
    return <Info className="h-5 w-5 text-ninma-purple" aria-hidden="true" />
  }

  return (
    <div
      className={cn(
        'flex w-full items-start gap-3 transition-all',
        t.visible ? 'animate-slide-in-from-top' : 'opacity-0'
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex-shrink-0 pt-0.5">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        {typeof t.message === 'string' ? (
          <p className="text-sm font-medium">{t.message}</p>
        ) : (
          t.message
        )}
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="flex-shrink-0 rounded-md p-1 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

// Custom Toast Message Component
export interface CustomToastProps {
  title: string
  description?: string
  variant?: 'success' | 'error' | 'warning' | 'info'
}

function CustomToastMessage({ title, description, variant = 'info' }: CustomToastProps) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-destructive" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-ninma-purple" />,
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 pt-0.5">{icons[variant]}</div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

// Toast Helper Functions
export const showToast = {
  success: (message: string) => {
    toast.success(message)
  },
  error: (message: string) => {
    toast.error(message)
  },
  custom: ({ title, description, variant = 'info' }: CustomToastProps) => {
    toast.custom(
      <CustomToastMessage title={title} description={description} variant={variant} />,
      {
        duration: variant === 'error' ? 5000 : 4000,
      }
    )
  },
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    })
  },
}

export { toast }
