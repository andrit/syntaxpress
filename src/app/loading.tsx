export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 animate-pulse">
      {/* Header skeleton */}
      <div className="h-10 w-48 bg-ink-100 mb-3" />
      <div className="h-4 w-96 bg-ink-100 mb-12" />

      <div className="rule-line mb-10" />

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-square bg-ink-100 mb-4" />
            <div className="h-4 w-3/4 bg-ink-100 mb-2" />
            <div className="h-3 w-1/3 bg-ink-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
