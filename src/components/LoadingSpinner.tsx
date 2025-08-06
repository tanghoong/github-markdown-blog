import { Skeleton } from '@/components/ui/skeleton'

export function LoadingSpinner() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
      
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border border-border rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-3" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-6 w-6 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}