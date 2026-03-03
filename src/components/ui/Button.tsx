import { forwardRef, type ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-electric-500/50"

    const variants = {
      primary: "bg-electric-500 hover:bg-electric-600 active:scale-[0.97] text-white",
      secondary: "bg-base-700 border border-base-600 hover:border-base-500 text-text-primary",
      danger: "bg-danger-500 hover:bg-danger-500/80 active:scale-[0.97] text-white",
      ghost: "bg-transparent hover:bg-base-700 text-text-secondary hover:text-text-primary",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-2.5 text-base",
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
export default Button
