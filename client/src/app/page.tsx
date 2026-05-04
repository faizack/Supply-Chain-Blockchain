"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Package, ShieldCheck, Truck, Users } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopNav } from "@/components/dashboard/top-navbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActionsDialog } from "@/components/dashboard/quick-actions-dialog";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { FlowTable } from "@/components/dashboard/flow-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const menuItems = [
  {
    path: "/register-roles",
    title: "Register Roles",
    description: "Register supplier, producer, distributor, and seller actors",
    stat: "26 active participants",
    icon: Users,
  },
  {
    path: "/order-materials",
    title: "Order Materials",
    description: "Owner creates products on-chain",
    stat: "12 pending orders",
    icon: Package,
  },
  {
    path: "/track-materials",
    title: "Track Materials",
    description: "Trace products through Created → Sold stages",
    stat: "88% batches in transit",
    icon: ShieldCheck,
  },
  {
    path: "/supply-materials",
    title: "Supply Materials",
    description: "Advance each product through pipeline transactions",
    stat: "4 active handoffs",
    icon: Truck,
  },
];

const supplyChainFlow = [
  { step: "1", stage: "Product Created", owner: "Owner", status: "Queued" },
  { step: "2", stage: "Processing", owner: "Supplier", status: "In Progress" },
  { step: "3", stage: "In Transit", owner: "Producer", status: "Queued" },
  { step: "4", stage: "For Sale", owner: "Distributor / Seller", status: "Pending" },
  { step: "5", stage: "Sold", owner: "Seller", status: "Awaiting" },
];

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timeoutId);
  }, []);

  const filteredItems = React.useMemo(() => {
    const searchValue = search.toLowerCase().trim();
    if (!searchValue) return menuItems;

    return menuItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchValue) ||
        item.description.toLowerCase().includes(searchValue),
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopNav search={search} onSearchChange={setSearch} />
          <main className="flex-1 space-y-6 p-4 md:p-6">
            {isLoading ? (
              <DashboardSkeleton />
            ) : (
              <>
                <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <StatCard title="Tracked Batches" value="124" hint="+8% from last cycle" />
                  <StatCard title="Verified Handoffs" value="412" hint="+12 today" />
                  <StatCard title="Compliance Alerts" value="3" hint="2 require immediate action" />
                </section>

                <section className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
                  <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Operational Routes</CardTitle>
                        <CardDescription>
                          Continue existing workflows from your core pages.
                        </CardDescription>
                      </div>
                      <QuickActionsDialog />
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {filteredItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className="rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{item.stat}</span>
                            </div>
                            <p className="font-medium">{item.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </button>
                        );
                      })}
                      {filteredItems.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No routes matched your search.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Quick Start</CardTitle>
                      <CardDescription>Fast access to common actions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/register-roles")}>
                        Register participant role
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/order-materials")}>
                        Create product order
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/track-materials")}>
                        Track material batch
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/supply-materials")}>
                        Manage supply transition
                      </Button>
                    </CardContent>
                  </Card>
                </section>

                <section>
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle>Supply Chain Progress</CardTitle>
                      <CardDescription>
                        Stage visibility reused from your original flow.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FlowTable rows={supplyChainFlow} />
                    </CardContent>
                  </Card>
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
