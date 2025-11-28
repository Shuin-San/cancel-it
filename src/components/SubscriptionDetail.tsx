"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { formatCurrency, formatDateLong } from "~/lib/utils";
import { ExternalLink, Trash2 } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { api } from "~/trpc/react";
import { toast } from "sonner";

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
  currency?: string;
  country?: string | null;
}

export function SubscriptionDetail({
  subscription,
  currency,
  country,
}: SubscriptionDetailProps) {
  const router = useRouter();

  const deleteSubscription = api.subscription.delete.useMutation({
    onSuccess: () => {
      toast.success("Subscription deleted successfully");
      router.push("/app/subscriptions");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete subscription");
    },
  });

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
            <div className="flex items-center gap-2">
              {getStatusBadge(subscription.status)}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={deleteSubscription.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this subscription? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteSubscription.mutate({ id: subscription.id })}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold">
                {formatCurrency(
                  parseFloat(subscription.averageAmount),
                  currency ?? subscription.currency,
                  country,
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
                  ? formatDateLong(subscription.nextExpectedDate, country)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">First Seen</p>
              <p className="text-lg font-semibold">
                {formatDateLong(subscription.firstSeen, country)}
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

