import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { sql } from "drizzle-orm";

async function testDatabaseConnection() {
  try {
    console.log("Testing database connection...\n");

    // Test 1: Simple query to check connection
    console.log("1. Testing basic connection...");
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Database connection successful!");
    console.log("   Result:", result[0]);

    // Test 2: Check if users table exists
    console.log("\n2. Checking if users table exists...");
    const tableCheck = await db.execute(
      sql`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cancel-it_user'
      ) as exists`
    );
    const tableExists = (tableCheck[0] as { exists: boolean })?.exists;
    if (tableExists) {
      console.log("✅ Users table exists");
    } else {
      console.log("⚠️  Users table does not exist. Run migrations first:");
      console.log("   npm run db:generate");
      console.log("   npm run db:migrate");
    }

    // Test 3: Try to query users table (if it exists)
    if (tableExists) {
      console.log("\n3. Querying users table...");
      const userCount = await db.select().from(users).limit(1);
      console.log(`✅ Successfully queried users table`);
      console.log(`   Sample record:`, userCount[0] || "No users found");
    }

    // Test 4: Check database version
    console.log("\n4. Checking PostgreSQL version...");
    const version = await db.execute(sql`SELECT version()`);
    console.log("✅ Database version:", (version[0] as { version: string })?.version);

    console.log("\n✅ All database tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database connection failed!");
    console.error("Error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.error("\n💡 Tip: Make sure your database is running:");
        console.error("   - Run: ./start-database.sh");
        console.error("   - Or check your DATABASE_URL in .env");
      } else if (error.message.includes("password authentication failed")) {
        console.error("\n💡 Tip: Check your DATABASE_URL password in .env");
      } else if (error.message.includes("does not exist")) {
        console.error("\n💡 Tip: Check your DATABASE_URL database name in .env");
      }
    }
    
    process.exit(1);
  }
}

testDatabaseConnection();

