"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Search, TrendingUp, Home, Settings, Star, FolderOpen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButton } from "@/components/auth-button";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/coins", label: "Top Coins", icon: BarChart3 },
  { href: "/categories", label: "Categories", icon: FolderOpen },
  { href: "/search", label: "Search", icon: Search },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

/**
 * App sidebar using shadcn/ui Sidebar component.
 * Collapses to icons on desktop; sheet on mobile.
 */
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/80">
      <SidebarHeader className="border-b border-sidebar-border/60 px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="CryptoDash" className="gap-2">
              <Link href="/" className="group/logo">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-lg font-bold transition-colors group-hover/logo:bg-primary/20" aria-hidden>
                  ₿
                </span>
                <span className="font-semibold tracking-tight group-data-[collapsible=icon]:hidden">CryptoDash</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center justify-between gap-1 px-2 py-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
          <ThemeToggle />
          <AuthButton />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
