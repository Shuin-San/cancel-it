"use client";

import { useState } from "react";
import { FileUpload } from "~/components/FileUpload";
import { PdfUpload } from "~/components/PdfUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FileText, FileSpreadsheet } from "lucide-react";

export default function ImportPage() {
  const router = useRouter();
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

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
      setCsvLoading(false);
    },
  });

  const importPdf = api.transaction.importPdf.useMutation({
    onSuccess: async (data) => {
      toast.success(`Imported ${data.count} transactions from PDF`);
      // Trigger subscription detection
      await detectSubscriptions.mutateAsync();
      router.push("/app/subscriptions");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to import PDF");
      setPdfLoading(false);
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

  // Get user settings for currency
  const { data: userSettings } = api.settings.get.useQuery();

  const handleCsvFileSelect = async (file: File) => {
    setCsvLoading(true);
    try {
      const text = await file.text();
      importCsv.mutate({ csvContent: text });
    } catch {
      toast.error("Failed to read file");
      setCsvLoading(false);
    }
  };

  const handlePdfFileSelect = async (file: File) => {
    setPdfLoading(true);
    try {
      // Convert file to base64 using FileReader
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix if present
          const base64String = result.includes(",")
            ? (result.split(",")[1] ?? result)
            : result;
          if (!base64String) {
            reject(new Error("Failed to convert file to base64"));
            return;
          }
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      importPdf.mutate({
        pdfBase64: base64,
        currency: userSettings?.currency ?? "USD",
      });
    } catch {
      toast.error("Failed to read PDF file");
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Transactions</h1>
        <p className="mt-1 text-muted-foreground">
          Upload a CSV file or bank statement PDF to automatically detect subscriptions
        </p>
      </div>

      <Tabs defaultValue="csv" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            CSV Upload
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Bank Statement PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Your CSV should have columns: date, amount, description (and optionally
                merchant)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onFileSelect={handleCsvFileSelect} isLoading={csvLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdf" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Bank Statement PDF</CardTitle>
              <CardDescription>
                Upload your bank statement PDF and we&apos;ll automatically extract all
                transactions using OCR technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PdfUpload onFileSelect={handlePdfFileSelect} isLoading={pdfLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
