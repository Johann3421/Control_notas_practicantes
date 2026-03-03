import { getInitials } from "@/lib/utils"

interface AvatarProps {
  name: string
  image?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
}

export default function Avatar({ name, image, size = "md", className = "" }: AvatarProps) {
  const initials = getInitials(name)

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-base-600 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-electric-500/20 border-2 border-electric-500/30 flex items-center justify-center font-mono font-bold text-electric-400 ${className}`}
    >
      {initials}
    </div>
  )
}
