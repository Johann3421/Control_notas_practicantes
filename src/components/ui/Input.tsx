import { forwardRef, type InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block font-sans text-xs font-semibold uppercase tracking-widest text-text-tertiary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full bg-base-700 border border-base-600 focus:border-electric-500 focus:ring-1 focus:ring-electric-500 text-text-primary rounded-lg px-3 py-2 text-sm placeholder:text-text-tertiary outline-none transition-colors duration-200 ${error ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-danger-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
export default Input
