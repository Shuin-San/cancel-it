import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Package,
  Mail,
  Clock,
  ArrowRight,
  CheckCircle2,
  TrendingDown,
  BarChart3,
  BookOpen,
  Calendar,
  Shield,
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/app/subscriptions");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container relative mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-8 gap-2">
              <Clock className="h-4 w-4" />
              Coming Soon
            </Badge>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Stop Wasting Money on
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
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
                <Link href="#notify">
                  Notify Me When It&apos;s Ready
                  <Mail className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Launching soon • Be the first to know
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="text-center pt-6">
                <div className="mb-2 text-4xl font-bold text-primary">$500+</div>
                <div className="text-muted-foreground">
                  Average annual savings per user
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="text-center pt-6">
                <div className="mb-2 text-4xl font-bold text-primary">3 min</div>
                <div className="text-muted-foreground">
                  To detect all your subscriptions
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="text-center pt-6">
                <div className="mb-2 text-4xl font-bold text-primary">$5.99</div>
                <div className="text-muted-foreground">Per month</div>
              </CardContent>
            </Card>
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
            <Card className="transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <CardTitle className="mb-2 text-xl">Automatic Detection</CardTitle>
                <CardDescription>
                  Upload your bank statements and we&apos;ll automatically identify all
                  recurring subscriptions. No manual entry required.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle className="mb-2 text-xl">Smart Analytics</CardTitle>
                <CardDescription>
                  See exactly how much you&apos;re spending monthly, track renewal
                  dates, and get insights into your subscription habits.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="mb-2 text-xl">Cancellation Guides</CardTitle>
                <CardDescription>
                  Step-by-step instructions to cancel any subscription quickly.
                  We&apos;ve done the research so you don&apos;t have to.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <CardTitle className="mb-2 text-xl">Renewal Alerts</CardTitle>
                <CardDescription>
                  Never be surprised by unexpected charges. Get notified before
                  subscriptions renew so you can cancel in time.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <CardTitle className="mb-2 text-xl">Privacy First</CardTitle>
                <CardDescription>
                  Your financial data stays on your device. We use bank-level
                  encryption and never sell your information.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="transition-all hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <CardTitle className="mb-2 text-xl">Save Money</CardTitle>
                <CardDescription>
                  Identify and cancel unused subscriptions. Most users save $500+
                  per year by eliminating forgotten charges.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold tracking-tight">
                Simple, Transparent Pricing
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Launching with a special early access offer
              </p>
            </div>

            <div className="mx-auto max-w-md">
              <Card className="border-2 border-primary">
                <CardHeader className="text-center">
                  <Badge variant="secondary" className="mb-2">
                    7-Day Free Trial
                  </Badge>
                  <CardTitle className="mb-2 text-5xl">
                    $5.99
                    <span className="text-xl font-normal text-muted-foreground">/month</span>
                  </CardTitle>
                  <CardDescription>
                    After your free trial ends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">Automatic subscription detection</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">Smart analytics and insights</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">Cancellation guides for all services</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">Renewal alerts and reminders</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">Cancel anytime, no commitments</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Notify Me Section */}
      <section id="notify" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold tracking-tight">
                Be the First to Know
              </h2>
              <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                Get notified when Cancel It launches. We&apos;ll send you early access
                and special launch pricing.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Notify Me
                    <Mail className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    We&apos;ll only email you when we launch. Unsubscribe anytime.
                  </p>
                </form>
              </CardContent>
            </Card>
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
              <Card className="border-0 bg-transparent shadow-none">
                <CardContent className="flex gap-4 pt-6">
                  <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <CardTitle className="mb-2">Risk-Free Trial</CardTitle>
                    <CardDescription>
                      Try Cancel It free for 7 days. No credit card required to start.
                      Cancel anytime.
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-transparent shadow-none">
                <CardContent className="flex gap-4 pt-6">
                  <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <CardTitle className="mb-2">Privacy Protected</CardTitle>
                    <CardDescription>
                      Your data never leaves your control. We use local processing
                      and encryption.
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-transparent shadow-none">
                <CardContent className="flex gap-4 pt-6">
                  <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <CardTitle className="mb-2">Easy to Use</CardTitle>
                    <CardDescription>
                      Beautiful, intuitive interface. No technical knowledge
                      required.
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-transparent shadow-none">
                <CardContent className="flex gap-4 pt-6">
                  <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <CardTitle className="mb-2">Comprehensive Guides</CardTitle>
                    <CardDescription>
                      Step-by-step cancellation instructions for hundreds of
                      popular services.
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Ready to Take Control?
            </h2>
            <p className="mb-10 text-xl text-white/90">
              Join the waitlist and be among the first to start saving money on
              your subscriptions.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link href="#notify">
                Join the Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-6 text-sm text-white/80">
              Launching soon • 7-day free trial • $5.99/month after
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
