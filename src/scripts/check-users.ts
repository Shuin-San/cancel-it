import { db } from "~/server/db";
import { users, accounts, verificationTokens } from "~/server/db/schema";
import { sql } from "drizzle-orm";

async function checkUsers() {
  try {
    console.log("Checking database for users...\n");

    // Check if tables exist
    const tablesCheck = await db.execute(
      sql`SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('cancel-it_user', 'cancel-it_account', 'cancel-it_verification_token')
          ORDER BY table_name`
    );

    console.log("1. Available tables:");
    if (tablesCheck.length === 0) {
      console.log("   ⚠️  No auth tables found. Run migrations:");
      console.log("      npm run db:generate");
      console.log("      npm run db:migrate");
      return;
    }
    tablesCheck.forEach((row: { table_name: string }) => {
      console.log(`   ✅ ${row.table_name}`);
    });

    // Check users
    console.log("\n2. Users in database:");
    const allUsers = await db.select().from(users);
    if (allUsers.length === 0) {
      console.log("   ⚠️  No users found in database");
    } else {
      console.log(`   ✅ Found ${allUsers.length} user(s):`);
      allUsers.forEach((user) => {
        console.log(`      - ${user.email} (ID: ${user.id})`);
        console.log(`        Created: ${user.emailVerified || "Not verified"}`);
      });
    }

    // Check accounts
    console.log("\n3. Accounts in database:");
    const allAccounts = await db.select().from(accounts);
    if (allAccounts.length === 0) {
      console.log("   ⚠️  No accounts found");
    } else {
      console.log(`   ✅ Found ${allAccounts.length} account(s):`);
      allAccounts.forEach((account) => {
        console.log(`      - Provider: ${account.provider}, User ID: ${account.userId}`);
      });
    }

    // Check verification tokens
    console.log("\n4. Pending verification tokens:");
    const tokens = await db.select().from(verificationTokens);
    if (tokens.length === 0) {
      console.log("   ℹ️  No pending verification tokens");
    } else {
      console.log(`   ✅ Found ${tokens.length} token(s):`);
      tokens.forEach((token) => {
        const expires = new Date(token.expires);
        const now = new Date();
        const expired = expires < now;
        console.log(`      - ${token.identifier} (${expired ? "EXPIRED" : "Active"}, expires: ${expires.toISOString()})`);
      });
    }

    console.log("\n✅ Database check complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error checking database!");
    console.error("Error:", error);
    process.exit(1);
  }
}

checkUsers();

