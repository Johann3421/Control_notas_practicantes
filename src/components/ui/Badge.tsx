interface BadgeProps {
  variant?: "success" | "danger" | "warning" | "info" | "violet" | "neutral"
  children: React.ReactNode
  className?: string
}

const variants = {
  success: "bg-neon-500/15 text-neon-400 border border-neon-500/30",
  danger: "bg-danger-500/15 text-danger-400 border border-danger-500/30",
  warning: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  info: "bg-electric-500/15 text-electric-400 border border-electric-500/30",
  violet: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
  neutral: "bg-base-600 text-text-secondary border border-base-500",
}

export default function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-xs ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
