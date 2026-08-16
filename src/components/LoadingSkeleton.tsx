function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/10 bg-white/10 ${className}`}
    />
  )
}

export function LoadingSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Shimmer className="h-72 w-full rounded-3xl md:h-80" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Shimmer className="h-24" />
        <Shimmer className="h-24" />
        <Shimmer className="h-24" />
        <Shimmer className="h-24" />
      </div>
      <Shimmer className="h-32" />
      <Shimmer className="h-72" />
    </div>
  )
}
