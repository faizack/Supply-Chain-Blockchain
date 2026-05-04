"use client";

import * as React from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopNav } from "@/components/dashboard/top-navbar";

type DashboardPageShellProps = {
  children: React.ReactNode;
  heading: string;
  subheading: string;
};

export function DashboardPageShell({
  children,
  heading,
  subheading,
}: DashboardPageShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopNav heading={heading} subheading={subheading} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
