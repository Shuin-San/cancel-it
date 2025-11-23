import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { formatCurrency } from "~/lib/utils";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface SubscriptionDetailProps {
  subscription: {
    id: string;
    merchant: {
      name: string;
    } | null;
    averageAmount: string;
    currency: string;
    billingInterval: string;
    nextExpectedDate: Date | null;
    firstSeen: Date;
    lastSeen: Date;
    status: "ACTIVE" | "CANCELLED" | "PENDING_CANCEL";
    fromManual: boolean;
    guide: {
      id: string;
      providerName: string;
      cancellationUrl: string | null;
      instructionsMd: string;
    } | null;
  };
}

export function SubscriptionDetail({ subscription }: SubscriptionDetailProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>;
      case "PENDING_CANCEL":
        return <Badge variant="outline">Pending Cancel</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {subscription.merchant?.name ?? "Unknown Merchant"}
              </CardTitle>
              <CardDescription className="mt-2">
                {subscription.fromManual ? "Manually added" : "Auto-detected"}
              </CardDescription>
            </div>
            {getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold">
                {formatCurrency(
                  parseFloat(subscription.averageAmount),
                  subscription.currency,
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Billing Interval</p>
              <p className="text-lg font-semibold capitalize">
                {subscription.billingInterval}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Next Renewal</p>
              <p className="text-lg font-semibold">
                {subscription.nextExpectedDate
                  ? format(new Date(subscription.nextExpectedDate), "MMMM d, yyyy")
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">First Seen</p>
              <p className="text-lg font-semibold">
                {format(new Date(subscription.firstSeen), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {subscription.guide && (
        <Card>
          <CardHeader>
            <CardTitle>Cancellation Guide</CardTitle>
            <CardDescription>
              Step-by-step instructions for canceling your {subscription.guide.providerName}{" "}
              subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MarkdownRenderer content={subscription.guide.instructionsMd} />
            {subscription.guide.cancellationUrl && (
              <Button asChild>
                <a
                  href={subscription.guide.cancellationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Go to Cancellation Page
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

