CREATE TABLE "cancel-it_waitlist" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	CONSTRAINT "cancel-it_waitlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "waitlist_email_idx" ON "cancel-it_waitlist" USING btree ("email");