export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-gradient-to-r from-base-700 via-base-600 to-base-700 animate-pulse rounded-lg ${className}`}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-base-800 border border-base-600 rounded-xl p-6 space-y-4 shadow-card">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-base-800 border border-base-600 rounded-xl p-6 shadow-card">
      <Skeleton className="h-4 w-1/4 mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
