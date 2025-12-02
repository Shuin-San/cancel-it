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
  Sparkles,
  Zap,
  Lock,
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/app/subscriptions");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Cancel It</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="#features">Features</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="#pricing">Pricing</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="#notify">Get Early Access</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-teal-50/50 to-cyan-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
        
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 gap-2 border-primary/20 bg-primary/5">
              <Clock className="h-3.5 w-3.5" />
              Coming Soon
            </Badge>
            
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Take Control of Your
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Subscriptions
              </span>
            </h1>
            
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
              Automatically detect, track, and manage your recurring subscriptions.
              <br className="hidden sm:block" />
              Save hundreds of dollars per year with intelligent insights.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="group text-base">
                <Link href="#notify">
                  Join the Waitlist
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
            
            <p className="mt-8 text-sm text-muted-foreground">
              $5.99/month • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">$500+</div>
              <div className="text-sm text-muted-foreground">
                Average annual savings
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">3 min</div>
              <div className="text-sm text-muted-foreground">
                To detect all subscriptions
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">
                Privacy protected
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge variant="outline" className="mb-4">
              Powerful Features
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Comprehensive tools to help you take control of your recurring expenses
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle>Automatic Detection</CardTitle>
                <CardDescription>
                  Upload bank statements and we&apos;ll automatically identify all recurring subscriptions. No manual entry required.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle>Smart Analytics</CardTitle>
                <CardDescription>
                  Track spending patterns, renewal dates, and get insights into your subscription habits with beautiful visualizations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle>Cancellation Guides</CardTitle>
                <CardDescription>
                  Step-by-step instructions to cancel any subscription quickly. We&apos;ve done the research so you don&apos;t have to.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Calendar className="h-6 w-6" />
                </div>
                <CardTitle>Renewal Alerts</CardTitle>
                <CardDescription>
                  Never be surprised by unexpected charges. Get notified before subscriptions renew so you can cancel in time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Lock className="h-6 w-6" />
                </div>
                <CardTitle>Privacy First</CardTitle>
                <CardDescription>
                  Your financial data stays secure. We use bank-level encryption and never sell your information to third parties.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <CardTitle>Save Money</CardTitle>
                <CardDescription>
                  Identify and cancel unused subscriptions. Most users save $500+ per year by eliminating forgotten charges.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <Badge variant="outline" className="mb-4">
                Simple Pricing
              </Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                One Plan, Everything Included
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Launching with a special early access offer
              </p>
            </div>

            <div className="mx-auto max-w-md">
              <Card className="relative border-2 border-primary shadow-xl">
                <div className="absolute -right-4 -top-4">
                  <Badge className="bg-primary text-primary-foreground">
                    Early Access
                  </Badge>
                </div>
                <CardHeader className="text-center flex flex-col items-center">
                  <div className="mb-4 flex flex-col items-center">
                    <span className="text-5xl font-bold">$5.99</span>
                    <span className="ml-2 text-xl text-muted-foreground">/month</span>
                  </div>

                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      "Automatic subscription detection",
                      "Smart analytics and insights",
                      "Cancellation guides for all services",
                      "Renewal alerts and reminders",
                      "Cancel anytime, no commitments",
                    ].map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button asChild size="lg" className="mt-6 w-full">
                    <Link href="#notify">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
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
            <div className="mb-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Be the First to Know
              </h2>
              <p className="mx-auto max-w-xl text-muted-foreground">
                Get notified when Cancel It launches. We&apos;ll send you early access and special launch pricing.
              </p>
            </div>

            <Card className="border-2">
              <CardContent className="pt-6">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="you@example.com"
                      required
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Notify Me
                    <Mail className="ml-2 h-4 w-4" />
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
              <Badge variant="outline" className="mb-4">
                Why Choose Us
              </Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Built for Your Peace of Mind
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Privacy Protected</h3>
                  <p className="text-muted-foreground">
                    Your data never leaves your control. We use local processing and encryption.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Easy to Use</h3>
                  <p className="text-muted-foreground">
                    Beautiful, intuitive interface. No technical knowledge required.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Comprehensive Guides</h3>
                  <p className="text-muted-foreground">
                    Step-by-step cancellation instructions for hundreds of popular services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to Take Control?
            </h2>
            <p className="mb-10 text-lg text-white/90 sm:text-xl">
              Join the waitlist and be among the first to start saving money on your subscriptions.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link href="#notify">
                Join the Waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="mt-8 text-sm text-white/80">
              Launching soon • $5.99/month
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="font-semibold">Cancel It</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Cancel It. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
