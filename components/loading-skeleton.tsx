import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px] mb-2" />
              <Skeleton className="h-3 w-[150px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-[150px] mb-2" />
            <Skeleton className="h-4 w-[250px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </div>
                <Skeleton className="h-4 w-[60px]" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
           <CardHeader>
            <Skeleton className="h-6 w-[120px] mb-2" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-6">
             <Skeleton className="h-20 w-full rounded-xl" />
             <div className="space-y-3">
                <Skeleton className="h-3 w-[100px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
