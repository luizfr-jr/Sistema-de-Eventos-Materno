import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const spinnerVariants = cva('inline-block animate-spin rounded-full border-solid', {
  variants: {
    size: {
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-3',
      xl: 'h-12 w-12 border-4',
    },
    variant: {
      primary: 'border-ninma-purple border-t-transparent',
      secondary: 'border-ninma-orange border-t-transparent',
      white: 'border-white border-t-transparent',
      current: 'border-current border-t-transparent',
      purple: 'border-ninma-purple border-t-transparent',
      orange: 'border-ninma-orange border-t-transparent',
      pink: 'border-ninma-pink border-t-transparent',
      teal: 'border-ninma-teal border-t-transparent',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
})

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
  showLabel?: boolean
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size,
      variant,
      label = 'Carregando...',
      showLabel = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center gap-2', className)}
        role="status"
        aria-live="polite"
        aria-label={label}
        {...props}
      >
        <div className={cn(spinnerVariants({ size, variant }))} aria-hidden="true" />
        {showLabel && (
          <span className="text-sm text-muted-foreground">{label}</span>
        )}
        {!showLabel && <span className="sr-only">{label}</span>}
      </div>
    )
  }
)
Spinner.displayName = 'Spinner'

export interface SpinnerOverlayProps extends SpinnerProps {
  fullScreen?: boolean
}

const SpinnerOverlay = React.forwardRef<HTMLDivElement, SpinnerOverlayProps>(
  (
    {
      className,
      size = 'lg',
      variant = 'primary',
      label = 'Carregando...',
      showLabel = true,
      fullScreen = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center',
          fullScreen
            ? 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm'
            : 'absolute inset-0 bg-background/50',
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={label}
        {...props}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={cn(spinnerVariants({ size, variant }))} aria-hidden="true" />
          {showLabel && (
            <p className="text-sm font-medium text-foreground">{label}</p>
          )}
          {!showLabel && <span className="sr-only">{label}</span>}
        </div>
      </div>
    )
  }
)
SpinnerOverlay.displayName = 'SpinnerOverlay'

// Dots Spinner Variant
export interface DotsSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'purple' | 'orange' | 'pink' | 'teal'
  label?: string
}

const DotsSpinner = React.forwardRef<HTMLDivElement, DotsSpinnerProps>(
  ({ className, size = 'md', variant = 'primary', label = 'Carregando...', ...props }, ref) => {
    const dotSize = {
      sm: 'h-2 w-2',
      md: 'h-3 w-3',
      lg: 'h-4 w-4',
    }

    const dotColors = {
      primary: 'bg-ninma-purple',
      secondary: 'bg-ninma-orange',
      purple: 'bg-ninma-purple',
      orange: 'bg-ninma-orange',
      pink: 'bg-ninma-pink',
      teal: 'bg-ninma-teal',
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-1', className)}
        role="status"
        aria-live="polite"
        aria-label={label}
        {...props}
      >
        <span className="sr-only">{label}</span>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn(
              'rounded-full animate-pulse',
              dotSize[size],
              dotColors[variant]
            )}
            style={{
              animationDelay: `${index * 150}ms`,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }
)
DotsSpinner.displayName = 'DotsSpinner'

export { Spinner, SpinnerOverlay, DotsSpinner, spinnerVariants }
