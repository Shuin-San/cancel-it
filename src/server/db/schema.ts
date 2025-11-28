import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "@auth/core/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `cancel-it_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .$defaultFn(() => /* @__PURE__ */ new Date()),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  bankConnections: many(bankConnections),
  transactions: many(transactions),
  subscriptions: many(subscriptions),
  settings: one(userSettings),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// Subscription Assistant Models

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "CANCELLED",
  "PENDING_CANCEL",
]);

export const bankConnections = createTable(
  "bank_connection",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    provider: d.varchar({ length: 255 }).notNull(),
    externalId: d.varchar({ length: 255 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [index("bank_connection_user_id_idx").on(t.userId)],
);

export const merchants = createTable(
  "merchant",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.varchar({ length: 255 }).notNull(),
    normalized: d.varchar({ length: 255 }).notNull().unique(),
    category: d.varchar({ length: 255 }),
    website: d.varchar({ length: 255 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [index("merchant_normalized_idx").on(t.normalized)],
);

export const transactions = createTable(
  "transaction",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    bankConnectionId: d.varchar({ length: 255 }).references(
      () => bankConnections.id,
    ),
    date: d.timestamp({ withTimezone: true }).notNull(),
    amount: d.numeric({ precision: 10, scale: 2 }).notNull(),
    currency: d.varchar({ length: 10 }).notNull(),
    descriptionRaw: d.text().notNull(),
    normalizedMerchant: d.varchar({ length: 255 }),
    merchantId: d.varchar({ length: 255 }).references(() => merchants.id),
    isSubscriptionLike: d.boolean().default(false).notNull(),
  }),
  (t) => [
    index("transaction_user_date_idx").on(t.userId, t.date),
    index("transaction_normalized_merchant_idx").on(t.normalizedMerchant),
  ],
);

export const subscriptionGuides = createTable(
  "subscription_guide",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    providerName: d.varchar({ length: 255 }).notNull(),
    providerSlug: d.varchar({ length: 255 }).notNull().unique(),
    category: d.varchar({ length: 255 }),
    cancellationUrl: d.varchar({ length: 500 }),
    instructionsMd: d.text().notNull(),
    emailTemplate: d.text(),
    lastReviewedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [index("subscription_guide_slug_idx").on(t.providerSlug)],
);

export const subscriptions = createTable(
  "subscription",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    merchantId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => merchants.id),
    status: subscriptionStatusEnum("status").default("ACTIVE").notNull(),
    averageAmount: d.numeric({ precision: 10, scale: 2 }).notNull(),
    currency: d.varchar({ length: 10 }).notNull(),
    billingInterval: d.varchar({ length: 50 }).notNull(),
    nextExpectedDate: d.timestamp({ withTimezone: true }),
    firstSeen: d.timestamp({ withTimezone: true }).notNull(),
    lastSeen: d.timestamp({ withTimezone: true }).notNull(),
    fromManual: d.boolean().default(false).notNull(),
    guideId: d.varchar({ length: 255 }).references(() => subscriptionGuides.id),
  }),
  (t) => [
    index("subscription_user_id_idx").on(t.userId),
    index("subscription_merchant_id_idx").on(t.merchantId),
  ],
);

export const userSettings = createTable(
  "user_settings",
  (d) => ({
    id: d
      .varchar({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id)
      .unique(),
    country: d.varchar({ length: 10 }),
    currency: d.varchar({ length: 10 }).default("USD").notNull(),
    emailNotificationsEnabled: d.boolean().default(true).notNull(),
    renewalRemindersEnabled: d.boolean().default(true).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d
      .timestamp({ withTimezone: true })
      .$onUpdate(() => new Date())
      .notNull(),
  }),
  (t) => [index("user_settings_user_id_idx").on(t.userId)],
);

// Relations

export const bankConnectionsRelations = relations(
  bankConnections,
  ({ one, many }) => ({
    user: one(users, {
      fields: [bankConnections.userId],
      references: [users.id],
    }),
    transactions: many(transactions),
  }),
);

export const merchantsRelations = relations(merchants, ({ many }) => ({
  subscriptions: many(subscriptions),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  bankConnection: one(bankConnections, {
    fields: [transactions.bankConnectionId],
    references: [bankConnections.id],
  }),
  merchant: one(merchants, {
    fields: [transactions.merchantId],
    references: [merchants.id],
  }),
}));

export const subscriptionsRelations = relations(
  subscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [subscriptions.userId],
      references: [users.id],
    }),
    merchant: one(merchants, {
      fields: [subscriptions.merchantId],
      references: [merchants.id],
    }),
    guide: one(subscriptionGuides, {
      fields: [subscriptions.guideId],
      references: [subscriptionGuides.id],
    }),
  }),
);

export const subscriptionGuidesRelations = relations(
  subscriptionGuides,
  ({ many }) => ({
    subscriptions: many(subscriptions),
  }),
);

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));
