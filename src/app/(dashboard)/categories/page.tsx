import { Suspense } from "react";
import Link from "next/link";
import { getCategoriesList } from "@/lib/api/coingecko";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, ChevronLeft, ChevronRight } from "lucide-react";

export const revalidate = 300;

const PER_PAGE = 50;

async function CategoriesContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const categories = await getCategoriesList();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const start = (page - 1) * PER_PAGE;
  const paginated = categories.slice(start, start + PER_PAGE);
  const totalPages = Math.ceil(categories.length / PER_PAGE);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="mt-1 text-muted-foreground">
          Browse cryptocurrencies by category
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginated.map((cat) => (
          <Link key={cat.category_id} href={`/categories/${cat.category_id}`}>
            <Card className="h-full cursor-pointer overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-accent/40 hover:shadow-lg hover:shadow-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FolderOpen className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium leading-tight">{cat.name}</p>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">View coins →</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" className="rounded-lg" asChild disabled={!hasPrev}>
          <Link href={hasPrev ? `/categories?page=${page - 1}` : "#"}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" className="rounded-lg" asChild disabled={!hasNext}>
          <Link href={hasNext ? `/categories?page=${page + 1}` : "#"}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      }
    >
      <CategoriesContent searchParams={searchParams} />
    </Suspense>
  );
}
