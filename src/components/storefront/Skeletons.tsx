import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function BlogFeaturedSkeleton() {
  return (
    <div className="group mb-10 grid md:grid-cols-2 overflow-hidden rounded-[2rem] border bg-card h-[400px]">
      <Skeleton className="h-full w-full rounded-none" />
      <div className="p-8 md:p-10 flex flex-col justify-center space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-6 w-32 pt-4" />
      </div>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col bg-card border rounded-[2rem] overflow-hidden border-border/50">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="p-8 flex flex-col flex-1 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-7 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="pt-4 border-t border-border/50 flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-background">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ShopHeaderSkeleton() {
  return (
    <div className="mb-10 rounded-3xl border bg-gradient-to-r from-primary/[0.08] via-background to-background p-6 md:p-10">
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-12 w-full md:w-3/4" />
        <Skeleton className="h-12 w-1/2 md:w-2/3" />
        <Skeleton className="h-6 w-full md:w-1/2" />
      </div>
    </div>
  );
}
