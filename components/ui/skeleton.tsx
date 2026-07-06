import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton rounded-xl", className)} {...props} />;
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass rounded-3xl p-5", className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="mt-4 h-8 w-2/3" />
      <Skeleton className="mt-3 h-2.5 w-full" />
    </div>
  );
}
