"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { formatCurrency, formatDateShort } from "~/lib/utils";
import Link from "next/link";

interface Subscription {
  id: string;
  merchant: {
    name: string;
  } | null;
  averageAmount: string;
  currency: string;
  billingInterval: string;
  nextExpectedDate: Date | null;
  status: "ACTIVE" | "CANCELLED" | "PENDING_CANCEL";
}

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  currency?: string;
  country?: string | null;
}

export function SubscriptionTable({
  subscriptions,
  currency,
  country,
}: SubscriptionTableProps) {
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Merchant</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Interval</TableHead>
            <TableHead>Next Renewal</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No subscriptions found
              </TableCell>
            </TableRow>
          ) : (
            subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/app/subscriptions/${sub.id}`}
                    className="hover:underline"
                  >
                    {sub.merchant?.name ?? "Unknown"}
                  </Link>
                </TableCell>
                <TableCell>
                  {formatCurrency(
                    parseFloat(sub.averageAmount),
                    currency ?? sub.currency,
                    country,
                  )}
                </TableCell>
                <TableCell className="capitalize">{sub.billingInterval}</TableCell>
                <TableCell>
                  {sub.nextExpectedDate
                    ? formatDateShort(sub.nextExpectedDate, country)
                    : "N/A"}
                </TableCell>
                <TableCell>{getStatusBadge(sub.status)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

