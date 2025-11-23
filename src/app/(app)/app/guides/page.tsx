import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { GuideCard } from "~/components/GuideCard";

export default async function GuidesPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const guides = await api.guide.list();

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cancellation Guides</h1>
          <p className="text-muted-foreground">
            Browse step-by-step guides for canceling popular subscription services
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <GuideCard
              key={guide.id}
              id={guide.id}
              providerName={guide.providerName}
              providerSlug={guide.providerSlug}
              category={guide.category}
              cancellationUrl={guide.cancellationUrl}
            />
          ))}
        </div>
      </div>
    </HydrateClient>
  );
}

