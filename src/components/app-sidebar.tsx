"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import {
  Package,
  Upload,
  BookOpen,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { signOut } from "next-auth/react";

const navigation = [
  {
    name: "Dashboard",
    href: "/app/subscriptions",
    icon: LayoutDashboard,
  },
  {
    name: "Import",
    href: "/app/import",
    icon: Upload,
  },
  {
    name: "Guides",
    href: "/app/guides",
    icon: BookOpen,
  },
];

interface AppSidebarProps {
  userEmail?: string | null;
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/app/subscriptions" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Cancel It</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        {userEmail && (
          <div className="mb-3 px-3">
            <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
            <p className="truncate text-sm font-medium">{userEmail}</p>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

