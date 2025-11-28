import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Shield, Info } from "lucide-react";

export function PrivacyNotice() {
  return (
    <Alert className="border-primary/50 bg-primary/5">
      <Shield className="h-4 w-4 text-primary" />
      <AlertTitle className="flex items-center gap-2">
        <Info className="h-4 w-4" />
        Privacy & Security
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p className="font-medium">
          Your bank statements are processed securely and deleted immediately after parsing.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>PDFs are processed using Google Vision API for text extraction</li>
          <li>Files are never stored on our servers</li>
          <li>All data is deleted from memory immediately after transaction extraction</li>
          <li>Only extracted transaction data is saved to your account</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}

