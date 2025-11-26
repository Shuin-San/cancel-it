"use client";

import { useState } from "react";
import { FileUpload } from "~/components/FileUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const importCsv = api.transaction.importCsv.useMutation({
    onSuccess: async (data) => {
      const result = data as { count: number };
      toast.success(`Imported ${result.count} transactions`);
      // Trigger subscription detection
      await detectSubscriptions.mutateAsync();
      router.push("/app/subscriptions");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to import CSV");
      setIsLoading(false);
    },
  });

  const detectSubscriptions = api.subscription.recalculate.useMutation({
    onSuccess: () => {
      toast.success("Subscriptions detected");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to detect subscriptions");
    },
  });

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      importCsv.mutate({ csvContent: text });
    } catch {
      toast.error("Failed to read file");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Transactions</h1>
        <p className="mt-1 text-muted-foreground">
          Upload a CSV file with your bank transactions to automatically detect
          subscriptions
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Your CSV should have columns: date, amount, description (and optionally
            merchant)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

