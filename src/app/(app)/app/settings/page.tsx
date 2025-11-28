import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { SettingsForm } from "~/components/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const settings = await api.settings.get();

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account preferences and notification settings
          </p>
        </div>

        <SettingsForm initialSettings={settings} />
      </div>
    </HydrateClient>
  );
}

