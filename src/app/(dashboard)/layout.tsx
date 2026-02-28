import { AppSidebar } from "@/components/layout/app-sidebar";
import { CoinSearch } from "@/components/crypto/coin-search";

/**
 * Dashboard layout with sidebar and search.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CoinSearch />
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
