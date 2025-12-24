export function PollCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-5 space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 skeleton rounded-full" />
          </div>
          <div className="h-6 w-3/4 skeleton rounded" />
        </div>
      </div>

      {/* Question */}
      <div className="space-y-1">
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-2/3 skeleton rounded" />
      </div>

      {/* Options */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 skeleton rounded-lg" />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-4">
          <div className="h-4 w-16 skeleton rounded" />
          <div className="h-4 w-12 skeleton rounded" />
        </div>
        <div className="h-4 w-20 skeleton rounded" />
      </div>
    </div>
  );
}
