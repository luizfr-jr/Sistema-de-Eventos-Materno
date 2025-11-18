import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        purple:
          'border-transparent bg-ninma-purple text-white hover:bg-ninma-purple-dark',
        orange:
          'border-transparent bg-ninma-orange text-white hover:bg-ninma-orange-dark',
        pink:
          'border-transparent bg-ninma-pink text-white hover:bg-ninma-pink/90',
        teal:
          'border-transparent bg-ninma-teal text-white hover:bg-ninma-teal/90',
        success:
          'border-transparent bg-green-500 text-white hover:bg-green-600',
        warning:
          'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        info:
          'border-transparent bg-blue-500 text-white hover:bg-blue-600',
        'purple-outline':
          'border-ninma-purple text-ninma-purple bg-ninma-purple/10',
        'orange-outline':
          'border-ninma-orange text-ninma-orange bg-ninma-orange/10',
        'pink-outline':
          'border-ninma-pink text-ninma-pink bg-ninma-pink/10',
        'teal-outline':
          'border-ninma-teal text-ninma-teal bg-ninma-teal/10',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      role="status"
      {...props}
    >
      {dot && (
        <span
          className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
