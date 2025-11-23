"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SubscriptionFormProps {
  guides?: Array<{
    id: string;
    providerName: string;
    providerSlug: string;
  }>;
}

export function SubscriptionForm({ guides = [] }: SubscriptionFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"guide" | "custom">("guide");
  const [selectedGuideId, setSelectedGuideId] = useState<string>("");
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [billingInterval, setBillingInterval] = useState<
    "weekly" | "monthly" | "quarterly" | "annual"
  >("monthly");

  const createSubscription = api.subscription.createManual.useMutation({
    onSuccess: () => {
      toast.success("Subscription added successfully");
      router.push("/app/subscriptions");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create subscription");
    },
  });

  const selectedGuide = guides.find((g) => g.id === selectedGuideId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "guide" && !selectedGuideId) {
      toast.error("Please select a guide");
      return;
    }

    if (mode === "custom" && !merchantName.trim()) {
      toast.error("Please enter a merchant name");
      return;
    }

    const finalMerchantName =
      mode === "guide" && selectedGuide
        ? selectedGuide.providerName
        : merchantName;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    createSubscription.mutate({
      merchantName: finalMerchantName,
      amount: amountNum,
      currency,
      billingInterval,
      guideId: mode === "guide" ? selectedGuideId : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Subscription Type</Label>
        <Select
          value={mode}
          onValueChange={(value) => setMode(value as "guide" | "custom")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="guide">Select from Guide</SelectItem>
            <SelectItem value="custom">Custom Subscription</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === "guide" && (
        <div className="space-y-2">
          <Label>Select Provider</Label>
          <Select value={selectedGuideId} onValueChange={setSelectedGuideId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a provider..." />
            </SelectTrigger>
            <SelectContent>
              {guides.map((guide) => (
                <SelectItem key={guide.id} value={guide.id}>
                  {guide.providerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {mode === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="merchant">Merchant Name</Label>
          <Input
            id="merchant"
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value)}
            placeholder="e.g., Netflix, Spotify"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="flex gap-2">
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interval">Billing Interval</Label>
        <Select
          value={billingInterval}
          onValueChange={(value) =>
            setBillingInterval(
              value as "weekly" | "monthly" | "quarterly" | "annual",
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={createSubscription.isPending} className="w-full">
        {createSubscription.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Add Subscription
      </Button>
    </form>
  );
}

