import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Mail, CheckCircle2 } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a magic link to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Magic link sent!</p>
                <p className="text-muted-foreground">
                  Click the link in the email to sign in. The link will expire in 24 hours.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>Didn&apos;t receive the email? Check your spam folder or try again.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

