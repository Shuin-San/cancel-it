import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface GuideCardProps {
  id: string;
  providerName: string;
  providerSlug: string;
  category?: string | null;
  cancellationUrl?: string | null;
}

export function GuideCard({
  providerName,
  providerSlug,
  category,
  cancellationUrl,
}: GuideCardProps) {
  return (
    <Link href={`/app/guides/${providerSlug}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>{providerName}</CardTitle>
            {category && <Badge variant="secondary">{category}</Badge>}
          </div>
          {cancellationUrl && (
            <CardDescription className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Cancellation page available
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}

