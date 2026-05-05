"use client";

import { User } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type DashboardTopNavProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
  heading?: string;
  subheading?: string;
};

export function DashboardTopNav({
  search,
  onSearchChange,
  heading = "Supply Chain Manager",
  subheading = "Dashboard",
}: DashboardTopNavProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div>
          <p className="text-sm text-muted-foreground">{subheading}</p>
          <h1 className="text-lg font-semibold">{heading}</h1>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          {typeof search === "string" && onSearchChange ? (
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search route or stage..."
              className="max-w-xs"
            />
          ) : null}
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Signed in as Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
