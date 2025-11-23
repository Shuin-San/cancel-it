import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { SubscriptionForm } from "~/components/SubscriptionForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default async function NewSubscriptionPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const guides = await api.guide.list();

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add Subscription</h1>
          <p className="text-muted-foreground">
            Add a subscription manually by selecting from a guide or entering custom details
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>New Subscription</CardTitle>
            <CardDescription>
              Choose to select from an existing guide or create a custom subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionForm guides={guides} />
          </CardContent>
        </Card>
      </div>
    </HydrateClient>
  );
}

