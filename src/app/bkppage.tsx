import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Upload,
  BookOpen,
  TrendingDown,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Calendar,
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/app/subscriptions");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container relative mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm backdrop-blur-sm">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Take control of your subscriptions today</span>
            </div>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Stop Wasting Money on
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}
                Forgotten Subscriptions
              </span>
            </h1>
            <p className="mb-10 text-xl text-muted-foreground sm:text-2xl">
              Automatically detect, track, and cancel unwanted subscriptions.
              Save hundreds of dollars per year with our smart subscription
              assistant.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/auth/signin">
                  Start 7-Day Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Try free for 7 days • Then $5.99/month • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">$500+</div>
              <div className="text-muted-foreground">
                Average annual savings per user
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">3 min</div>
              <div className="text-muted-foreground">
                To detect all your subscriptions
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">7 days</div>
              <div className="text-muted-foreground">Free trial</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">
              Everything You Need to Manage Subscriptions
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Powerful features to help you take control of your recurring
              expenses
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Automatic Detection
              </h3>
              <p className="text-muted-foreground">
                Upload your bank statements and we&apos;ll automatically identify all
                recurring subscriptions. No manual entry required.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Smart Analytics
              </h3>
              <p className="text-muted-foreground">
                See exactly how much you&apos;re spending monthly, track renewal
                dates, and get insights into your subscription habits.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Cancellation Guides
              </h3>
              <p className="text-muted-foreground">
                Step-by-step instructions to cancel any subscription quickly.
                We&apos;ve done the research so you don&apos;t have to.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Renewal Alerts
              </h3>
              <p className="text-muted-foreground">
                Never be surprised by unexpected charges. Get notified before
                subscriptions renew so you can cancel in time.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Privacy First
              </h3>
              <p className="text-muted-foreground">
                Your financial data stays on your device. We use bank-level
                encryption and never sell your information.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-lg border bg-card p-6 transition-all hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingDown className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Save Money
              </h3>
              <p className="text-muted-foreground">
                Identify and cancel unused subscriptions. Most users save $500+
                per year by eliminating forgotten charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Get started in minutes and start saving money today
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  1
                </div>
                <h3 className="mb-2 text-xl font-semibold">Import Transactions</h3>
                <p className="text-muted-foreground">
                  Upload your bank statement CSV file. We support all major
                  banks and formats.
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  2
                </div>
                <h3 className="mb-2 text-xl font-semibold">Auto-Detect</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes your transactions and automatically identifies
                  all recurring subscriptions.
                </p>
              </div>

              <div className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                  3
                </div>
                <h3 className="mb-2 text-xl font-semibold">Take Action</h3>
                <p className="text-muted-foreground">
                  Review your subscriptions, get cancellation guides, and start
                  saving money immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold tracking-tight">
                Simple, Transparent Pricing
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Start your free trial today. No credit card required.
              </p>
            </div>

            <div className="mx-auto max-w-md">
              <div className="rounded-lg border-2 border-primary bg-card p-8 shadow-lg">
                <div className="mb-6 text-center">
                  <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    7-Day Free Trial
                  </div>
                  <div className="mb-2 text-5xl font-bold">
                    $5.99
                    <span className="text-xl font-normal text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    After your free trial ends
                  </p>
                </div>
                <ul className="mb-8 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-sm">Automatic subscription detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-sm">Smart analytics and insights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-sm">Cancellation guides for all services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-sm">Renewal alerts and reminders</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-sm">Cancel anytime, no commitments</span>
                  </li>
                </ul>
                <Button asChild size="lg" className="w-full">
                  <Link href="/auth/signin">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  No credit card required for trial
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold tracking-tight">
                Why Choose Cancel It?
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex gap-4">
                <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="mb-2 font-semibold">
                    Risk-Free Trial
                  </h3>
                  <p className="text-muted-foreground">
                    Try Cancel It free for 7 days. No credit card required to start.
                    Cancel anytime.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="mb-2 font-semibold">
                    Privacy Protected
                  </h3>
                  <p className="text-muted-foreground">
                    Your data never leaves your control. We use local processing
                    and encryption.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="mb-2 font-semibold">
                    Easy to Use
                  </h3>
                  <p className="text-muted-foreground">
                    Beautiful, intuitive interface. No technical knowledge
                    required.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="mb-2 font-semibold">
                    Comprehensive Guides
                  </h3>
                  <p className="text-muted-foreground">
                    Step-by-step cancellation instructions for hundreds of
                    popular services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-purple-600 to-blue-600 py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Ready to Take Control?
            </h2>
            <p className="mb-10 text-xl text-purple-100">
              Join thousands of users who are saving money by managing their
              subscriptions better. Get started in 2 minutes.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link href="/auth/signin">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-6 text-sm text-purple-200">
              7-day free trial • Then $5.99/month • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

