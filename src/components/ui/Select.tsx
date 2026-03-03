import { forwardRef, type SelectHTMLAttributes } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block font-sans text-xs font-semibold uppercase tracking-widest text-text-tertiary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`w-full bg-base-700 border border-base-600 focus:border-electric-500 focus:ring-1 focus:ring-electric-500 text-text-primary rounded-lg px-3 py-2 text-sm outline-none transition-colors duration-200 ${error ? "border-danger-500" : ""} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" className="text-text-tertiary">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-base-700">
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-danger-400">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"
export default Select
