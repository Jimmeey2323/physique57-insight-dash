
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-slate-50 text-slate-700 px-2.5 py-1 text-xs",
        secondary: "border-slate-200 bg-white text-slate-600 px-2.5 py-1 text-xs shadow-sm",
        destructive: "border-red-200 bg-red-50 text-red-700 px-2.5 py-1 text-xs",
        outline: "border-slate-200 text-slate-700 px-2.5 py-1 text-xs bg-white shadow-sm",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-medium",
        warning: "border-amber-200 bg-amber-50 text-amber-700 px-2.5 py-1 text-xs font-medium",
        info: "border-blue-200 bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-medium",
        premium: "border-purple-200 bg-purple-50 text-purple-700 px-2.5 py-1 text-xs font-medium",
        conversion: "border-blue-200 bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-medium",
        retention: "border-emerald-200 bg-emerald-50 text-emerald-700 px-2.5 py-1 text-xs font-medium",
        excluded: "border-red-200 bg-red-50 text-red-700 px-2.5 py-1 text-xs font-medium",
        modern: "border-slate-200 bg-white text-slate-700 px-2.5 py-1 text-xs font-medium shadow-sm",
        luxury: "border-slate-200 bg-gradient-to-r from-white to-slate-50 text-slate-700 px-2.5 py-1 text-xs font-medium shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
