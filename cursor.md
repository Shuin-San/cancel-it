
# Smart Subscription Assistant – Full cursor.md

## 1. Project Overview
A **Smart Subscription Assistant** that:
- Imports or connects to bank transactions.
- Detects recurring payments & identifies subscriptions.
- Displays a subscription dashboard with renewal predictions.
- Provides **smart cancellation guides**, not automated bot cancellations.
- Fully legal, user-in-the-loop, no ToS violations.

---

## 2. Tech Stack
- **Next.js (App Router)**
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui**
- **Prisma + PostgreSQL**
- **Auth.js**
- **tRPC**
- **Zod**
- **Sonner**
- Import alias: `~`

---

## 3. Full Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String            @id @default(cuid())
  email           String            @unique
  name            String?
  image           String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  bankConnections BankConnection[]
  transactions    Transaction[]
  subscriptions   Subscription[]
}

model BankConnection {
  id          String   @id @default(cuid())
  userId      String
  provider    String
  externalId  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
}

model Transaction {
  id                 String    @id @default(cuid())
  userId             String
  bankConnectionId   String?
  date               DateTime
  amount             Decimal   @db.Decimal(10, 2)
  currency           String
  descriptionRaw     String
  normalizedMerchant String?
  merchantId         String?
  isSubscriptionLike Boolean   @default(false)

  user           User           @relation(fields: [userId], references: [id])
  bankConnection BankConnection @relation(fields: [bankConnectionId], references: [id])
  merchant       Merchant?      @relation(fields: [merchantId], references: [id])

  @@index([userId, date])
  @@index([normalizedMerchant])
}

model Merchant {
  id           String          @id @default(cuid())
  name         String
  normalized   String          @unique
  category     String?
  website      String?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  subscriptions Subscription[]
  transactions  Transaction[]
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  PENDING_CANCEL
}

model Subscription {
  id                String             @id @default(cuid())
  userId            String
  merchantId        String
  status            SubscriptionStatus @default(ACTIVE)
  averageAmount     Decimal            @db.Decimal(10, 2)
  currency          String
  billingInterval   String
  nextExpectedDate  DateTime?
  firstSeen         DateTime
  lastSeen          DateTime
  fromManual        Boolean            @default(false)
  guideId           String?

  user      User              @relation(fields: [userId], references: [id])
  merchant  Merchant          @relation(fields: [merchantId], references: [id])
  guide     SubscriptionGuide @relation(fields: [guideId], references: [id])

  @@index([userId])
  @@index([merchantId])
}

model SubscriptionGuide {
  id              String   @id @default(cuid())
  providerName    String
  providerSlug    String   @unique
  category        String?
  cancellationUrl String?
  instructionsMd  String
  emailTemplate   String?
  lastReviewedAt  DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  subscriptions   Subscription[]
}
```

---

## 4. Seed Data (`prisma/seed.ts`)

```ts
import { prisma } from "../src/server/db";

async function main() {
  await prisma.subscriptionGuide.createMany({
    data: [
      {
        providerName: "Netflix",
        providerSlug: "netflix",
        cancellationUrl: "https://www.netflix.com/cancelplan",
        instructionsMd: `
## Canceling Netflix
1. Log into your account.
2. Go to **Account**.
3. Under *Membership & Billing*, click **Cancel Membership**.
4. Confirm cancellation.
        `,
      },
      {
        providerName: "Spotify",
        providerSlug: "spotify",
        cancellationUrl: "https://www.spotify.com/account/subscription/",
        instructionsMd: `
## Canceling Spotify
1. Go to your Spotify account page.
2. Navigate to **Your Plan**.
3. Select **Change Plan**.
4. Scroll to **Spotify Free** → click **Cancel Premium**.
        `,
      }
    ]
  });
}

main();
```

---

## 5. Folder Structure

```
app/
├── (marketing)/
│   └── page.tsx
│
├── (app)/app/
│   ├── page.tsx
│   ├── import/page.tsx
│   ├── subscriptions/page.tsx
│   ├── subscriptions/[id]/page.tsx
│   ├── guides/page.tsx
│   └── guides/[slug]/page.tsx

components/
├── FileUpload.tsx
├── SubscriptionSummaryCards.tsx
├── SubscriptionTable.tsx
├── SubscriptionDetail.tsx
├── GuideCard.tsx
└── MarkdownRenderer.tsx

server/
├── api/
│   ├── subscriptionRouter.ts
│   ├── transactionRouter.ts
│   └── guideRouter.ts
└── logic/
    └── subscriptions.ts
```

---

## 6. tRPC Routers

### subscriptionRouter

```ts
getAll
getById
recalculate
```

### transactionRouter

```ts
importCsv
list
```

### guideRouter

```ts
list
getBySlug
```

---

## 7. Detection Logic (Example)

```ts
export async function detectSubscriptionsForUser(userId: string) {
  const txs = await prisma.transaction.findMany({ where: { userId } });

  const groups = groupByMerchant(txs);

  for (const group of groups) {
    if (!isRecurring(group)) continue;

    await prisma.subscription.upsert({
      where: { userId_merchantId: { userId, merchantId: group.merchantId }},
      update: {
        averageAmount: avg(group.amounts),
        lastSeen: group.lastDate,
        nextExpectedDate: estimateNext(group),
      },
      create: {
        userId,
        merchantId: group.merchantId,
        averageAmount: avg(group.amounts),
        currency: group.currency,
        firstSeen: group.firstDate,
        lastSeen: group.lastDate,
        billingInterval: "monthly",
      }
    });
  }
}
```

---

## 8. Pages to Implement

### `/app/import`
- File upload
- Send to tRPC `transactionRouter.importCsv`
- Call detection after upload

### `/app/subscriptions`
- Summary cards
- Table of subscriptions

### `/app/subscriptions/[id]`
- Full subscription breakdown
- Cancellation instructions
- Link to cancellation page

### `/app/guides`
- List of guides

### `/app/guides/[slug]`
- Markdown-rendered guide

---

## 9. UI Requirements

- Use shadcn/ui components.
- Keep everything clean & modern.
- Use Tailwind for layout and spacing.
- Use `sonner` for user feedback.

---

## 10. Cursor’s Job

Cursor should:

1. Implement the Prisma schema.
2. Generate the tRPC routers.
3. Build the React pages following the folder structure.
4. Create components based on the specs.
5. Implement CSV import → parsing → subscription detection.
6. Build guide pages with Markdown rendering.
7. Polish UI & UX.

---

## 11. Goal

This file serves as the full blueprint for Cursor to scaffold  
and build the **entire Smart Subscription Assistant MVP**.

