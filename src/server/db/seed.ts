import { db } from "./index";
import { subscriptionGuides } from "./schema";

async function main() {
  await db.insert(subscriptionGuides).values([
    {
      id: crypto.randomUUID(),
      providerName: "Netflix",
      providerSlug: "netflix",
      cancellationUrl: "https://www.netflix.com/cancelplan",
      instructionsMd: `## Canceling Netflix
1. Log into your account.
2. Go to **Account**.
3. Under *Membership & Billing*, click **Cancel Membership**.
4. Confirm cancellation.`,
    },
    {
      id: crypto.randomUUID(),
      providerName: "Spotify",
      providerSlug: "spotify",
      cancellationUrl: "https://www.spotify.com/account/subscription/",
      instructionsMd: `## Canceling Spotify
1. Go to your Spotify account page.
2. Navigate to **Your Plan**.
3. Select **Change Plan**.
4. Scroll to **Spotify Free** → click **Cancel Premium**.`,
    },
  ]);
}

main()
  .then(() => {
    console.log("Seed completed");
    process.exit(0);
  })
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });

