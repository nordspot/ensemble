import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-accent-500 text-white',
        secondary:
          'bg-ensemble-100 text-ensemble-900 dark:bg-ensemble-800 dark:text-ensemble-50',
        outline:
          'border border-ensemble-200 text-ensemble-900 dark:border-ensemble-700 dark:text-ensemble-50',
        success:
          'bg-success/10 text-success dark:bg-success/20',
        warning:
          'bg-warning/10 text-warning dark:bg-warning/20',
        error:
          'bg-error/10 text-error dark:bg-error/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
export type { BadgeProps };
