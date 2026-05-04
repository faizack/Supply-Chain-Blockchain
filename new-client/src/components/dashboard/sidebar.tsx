"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PackageCheck, ShieldCheck, Truck, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/roles", label: "Register Roles", icon: UserCog },
  { href: "/addmed", label: "Order Materials", icon: PackageCheck },
  { href: "/track", label: "Track Materials", icon: ShieldCheck },
  { href: "/supply", label: "Supply Materials", icon: Truck },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-muted/30 md:block">
      <div className="flex h-full flex-col p-4">
        <div className="mb-6 rounded-xl border bg-background p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Supply Chain
          </p>
          <p className="mt-1 text-sm font-semibold">Operations Console</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
