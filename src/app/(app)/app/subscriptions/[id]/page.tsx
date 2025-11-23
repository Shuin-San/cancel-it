import { redirect, notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { SubscriptionDetail } from "~/components/SubscriptionDetail";

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session) {
    redirect("/auth/signin");
  }

  const subscription = await api.subscription.getById({ id });

  if (!subscription) {
    notFound();
  }

  return (
    <HydrateClient>
      <SubscriptionDetail subscription={subscription} />
    </HydrateClient>
  );
}

