export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header Skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-300"></div>
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="h-10 w-24 animate-pulse rounded bg-gray-300"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border bg-white p-4"
            >
              <div className="mb-2 h-4 w-20 rounded bg-gray-200"></div>
              <div className="h-8 w-16 rounded bg-gray-300"></div>
            </div>
          ))}
        </div>

        {/* Main Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border bg-white p-6"
            >
              <div className="mb-4 h-6 w-32 rounded bg-gray-300"></div>
              <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
              <div className="h-10 w-full rounded bg-gray-300"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
