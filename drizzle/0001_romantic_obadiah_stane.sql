CREATE TABLE "cancel-it_user_settings" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"country" varchar(10),
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"emailNotificationsEnabled" boolean DEFAULT true NOT NULL,
	"renewalRemindersEnabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	CONSTRAINT "cancel-it_user_settings_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "cancel-it_user_settings" ADD CONSTRAINT "cancel-it_user_settings_userId_cancel-it_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."cancel-it_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_settings_user_id_idx" ON "cancel-it_user_settings" USING btree ("userId");