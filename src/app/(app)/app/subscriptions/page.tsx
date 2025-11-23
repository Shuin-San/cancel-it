import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { SubscriptionSummaryCards } from "~/components/SubscriptionSummaryCards";
import { SubscriptionTable } from "~/components/SubscriptionTable";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function SubscriptionsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const subscriptions = await api.subscription.getAll();

  // Calculate summary stats
  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
  const totalCost = activeSubs.reduce((sum, sub) => {
    // Convert to monthly cost
    let monthlyCost = parseFloat(sub.averageAmount);
    if (sub.billingInterval === "quarterly") {
      monthlyCost = monthlyCost / 3;
    } else if (sub.billingInterval === "annual") {
      monthlyCost = monthlyCost / 12;
    } else if (sub.billingInterval === "weekly") {
      monthlyCost = monthlyCost * 4;
    }
    return sum + monthlyCost;
  }, 0);

  const nextRenewal = activeSubs
    .map((s) => s.nextExpectedDate)
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return (
    <HydrateClient>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your subscriptions and spending
            </p>
          </div>
          <Button asChild>
            <Link href="/app/subscriptions/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Subscription
            </Link>
          </Button>
        </div>

        {/* Summary Cards */}
        <SubscriptionSummaryCards
          totalCost={totalCost}
          activeCount={activeSubs.length}
          nextRenewal={nextRenewal}
        />

        {/* Subscriptions Table */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Subscriptions</h2>
            <span className="text-sm text-muted-foreground">
              {subscriptions.length} total
            </span>
          </div>
          <SubscriptionTable subscriptions={subscriptions} />
        </div>
      </div>
    </HydrateClient>
  );
}

