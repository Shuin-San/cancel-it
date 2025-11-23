import Link from "next/link";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";

export default async function MarketingPage() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="container flex max-w-4xl flex-col items-center gap-8 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            Smart Subscription
            <span className="text-primary"> Assistant</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Track your subscriptions, detect recurring payments, and get
            step-by-step cancellation guides. Take control of your recurring
            expenses.
          </p>
          <div className="flex gap-4">
            {session ? (
              <Button asChild size="lg">
                <Link href="/app/subscriptions">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/auth/signin">Get Started</Link>
              </Button>
            )}
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Import Transactions</h3>
              <p className="text-sm text-muted-foreground">
                Upload CSV files from your bank to automatically detect
                subscriptions
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Smart Detection</h3>
              <p className="text-sm text-muted-foreground">
                Our algorithm identifies recurring payments and predicts renewal
                dates
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Cancellation Guides</h3>
              <p className="text-sm text-muted-foreground">
                Step-by-step instructions to cancel any subscription quickly and
                easily
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

