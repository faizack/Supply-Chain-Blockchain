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
import { getContract } from "@/lib/web3";
import { parseTransactionError } from "@/lib/errorUtils";
import { showNotification } from "@/components/Notification";

type DashboardData = {
  productCount: number;
  participantCount: number;
  soldCount: number;
  stageCounts: {
    created: number;
    processing: number;
    inTransit: number;
    forSale: number;
    sold: number;
  };
};

const menuItems = [
  {
    path: "/register-roles",
    title: "Register Roles",
    description: "Register supplier, producer, distributor, and seller actors",
    statKey: "participants",
    icon: Users,
  },
  {
    path: "/order-materials",
    title: "Order Materials",
    description: "Create products on-chain as a registered producer",
    statKey: "products",
    icon: Package,
  },
  {
    path: "/track-materials",
    title: "Track Materials",
    description: "Trace products through Created → Sold stages",
    statKey: "inTransit",
    icon: ShieldCheck,
  },
  {
    path: "/supply-materials",
    title: "Supply Materials",
    description: "Advance each product through pipeline transactions",
    statKey: "forSale",
    icon: Truck,
  },
];

const defaultDashboardData: DashboardData = {
  productCount: 0,
  participantCount: 0,
  soldCount: 0,
  stageCounts: {
    created: 0,
    processing: 0,
    inTransit: 0,
    forSale: 0,
    sold: 0,
  },
};

export default function Home() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [dashboardData, setDashboardData] = React.useState<DashboardData>(defaultDashboardData);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const { contract } = await getContract();

        const [productCtr, supplierCtr, producerCtr, distributorCtr, sellerCtr] = await Promise.all([
          contract.methods.productCtr().call(),
          contract.methods.supplierCtr().call(),
          contract.methods.producerCtr().call(),
          contract.methods.distributorCtr().call(),
          contract.methods.sellerCtr().call(),
        ]);

        const productCount = Number(productCtr);
        const participantCount =
          Number(supplierCtr) + Number(producerCtr) + Number(distributorCtr) + Number(sellerCtr);

        const stageCounts = {
          created: 0,
          processing: 0,
          inTransit: 0,
          forSale: 0,
          sold: 0,
        };

        for (let i = 1; i <= productCount; i++) {
          const row = (await contract.methods.ProductStock(i).call()) as { stage?: string | number };
          const stage = Number(row.stage ?? 0);
          if (stage === 0) stageCounts.created++;
          else if (stage === 1) stageCounts.processing++;
          else if (stage === 2) stageCounts.inTransit++;
          else if (stage === 3) stageCounts.forSale++;
          else if (stage === 4) stageCounts.sold++;
        }

        setDashboardData({
          productCount,
          participantCount,
          soldCount: stageCounts.sold,
          stageCounts,
        });
      } catch (err: unknown) {
        console.error("Error loading homepage dashboard data:", err);
        const parsed = parseTransactionError(err);
        showNotification(parsed.message, "error");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  const stageFlowRows = React.useMemo(
    () => [
      { step: "1", stage: "Product Created", owner: "Producer", status: `${dashboardData.stageCounts.created} batches` },
      { step: "2", stage: "Processing", owner: "Supplier", status: `${dashboardData.stageCounts.processing} batches` },
      { step: "3", stage: "In Transit", owner: "Producer", status: `${dashboardData.stageCounts.inTransit} batches` },
      { step: "4", stage: "For Sale", owner: "Distributor / Seller", status: `${dashboardData.stageCounts.forSale} batches` },
      { step: "5", stage: "Sold", owner: "Seller", status: `${dashboardData.stageCounts.sold} batches` },
    ],
    [dashboardData.stageCounts],
  );

  const statByKey = React.useMemo(
    () => ({
      participants: `${dashboardData.participantCount} registered`,
      products: `${dashboardData.productCount} products`,
      inTransit: `${dashboardData.stageCounts.inTransit} in transit`,
      forSale: `${dashboardData.stageCounts.forSale} for sale`,
    }),
    [dashboardData],
  );

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
                  <StatCard title="Total Products" value={dashboardData.productCount.toString()} hint="Live on-chain product count" />
                  <StatCard title="Registered Participants" value={dashboardData.participantCount.toString()} hint="Suppliers + Producers + Distributors + Sellers" />
                  <StatCard title="Sold Products" value={dashboardData.soldCount.toString()} hint="Products completed at Sold stage" />
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
                              <span className="text-xs text-muted-foreground">
                                {statByKey[item.statKey as keyof typeof statByKey]}
                              </span>
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
                        Real-time stage distribution from on-chain ProductStock.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FlowTable rows={stageFlowRows} />
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
