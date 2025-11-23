import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import { Calendar, DollarSign, Package } from "lucide-react";

interface SubscriptionSummaryCardsProps {
  totalCost: number;
  activeCount: number;
  nextRenewal?: Date | null;
  currency?: string;
}

export function SubscriptionSummaryCards({
  totalCost,
  activeCount,
  nextRenewal,
  currency = "USD",
}: SubscriptionSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Monthly Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalCost, currency)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Renewal</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {nextRenewal
              ? new Date(nextRenewal).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

