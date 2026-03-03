import Skeleton, { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton"

export default function MentorLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="mb-2 h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <SkeletonTable />
    </div>
  )
}
