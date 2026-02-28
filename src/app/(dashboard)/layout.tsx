import { AppSidebar } from "@/components/layout/app-sidebar";
import { CoinSearch } from "@/components/crypto/coin-search";
import { CurrencySelector } from "@/components/crypto/currency-selector";
import { getCurrency } from "@/app/actions/currency";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

/**
 * Dashboard layout with collapsible sidebar (shadcn/ui).
 * Uses SidebarProvider for state; SidebarInset for main content.
 * Cmd/Ctrl+B toggles sidebar.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currency = await getCurrency();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
          <CoinSearch />
          <div className="ml-auto flex items-center gap-2">
            <CurrencySelector value={currency} />
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
