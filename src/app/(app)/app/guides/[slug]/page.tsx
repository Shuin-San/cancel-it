import { redirect, notFound } from "next/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { MarkdownRenderer } from "~/components/MarkdownRenderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ExternalLink } from "lucide-react";

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;

  if (!session) {
    redirect("/auth/signin");
  }

  const guide = await api.guide.getBySlug({ slug });

  if (!guide) {
    notFound();
  }

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{guide.providerName}</h1>
          <p className="text-muted-foreground">Cancellation Guide</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How to Cancel {guide.providerName}</CardTitle>
            <CardDescription>
              Follow these step-by-step instructions to cancel your subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MarkdownRenderer content={guide.instructionsMd} />
            {guide.cancellationUrl && (
              <Button asChild>
                <a
                  href={guide.cancellationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Go to Cancellation Page
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </HydrateClient>
  );
}

