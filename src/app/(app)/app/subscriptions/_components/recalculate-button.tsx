"use client";

import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export function RecalculateButton() {
  const utils = api.useUtils();
  const recalculate = api.subscription.recalculate.useMutation({
    onSuccess: () => {
      toast.success("Subscriptions recalculated!");
      void utils.subscription.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to recalculate: ${error.message}`);
    },
  });

  return (
    <Button
      variant="outline"
      onClick={() => recalculate.mutate()}
      disabled={recalculate.isPending}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${recalculate.isPending ? "animate-spin" : ""}`} />
      Recalculate
    </Button>
  );
}

