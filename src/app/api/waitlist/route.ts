import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { waitlist } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { env } from "~/env";

const resend = new Resend(env.RESEND_API_KEY);

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const { email } = waitlistSchema.parse(body);

    // Check if email already exists
    const existing = await db.query.waitlist.findFirst({
      where: eq(waitlist.email, email),
    });

    if (existing) {
      // Return success but indicate it's a duplicate - don't send email
      return NextResponse.json(
        { message: "You are already registered", duplicate: true },
        { status: 200 },
      );
    }

    // Insert into database
    const [newEntry] = await db
      .insert(waitlist)
      .values({
        id: crypto.randomUUID(),
        email,
      })
      .returning();

    if (!newEntry) {
      throw new Error("Failed to add email to waitlist");
    }

    // Send confirmation email
    try {
      await resend.emails.send({
        from: env.EMAIL_FROM,
        to: email,
        subject: "Welcome to Cancel It Waitlist! 🎉",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">You're on the list! 🎉</h1>
              </div>
              <div style="background: #ffffff; padding: 40px 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; margin: 0 0 20px 0;">Hi there,</p>
                <p style="font-size: 16px; margin: 0 0 20px 0;">
                  Thank you for joining the Cancel It waitlist! We're excited to have you on board.
                </p>
                <p style="font-size: 16px; margin: 0 0 20px 0;">
                  We're working hard to launch Cancel It and help you take control of your subscriptions. You'll be among the first to know when we launch, and you'll get early access to special launch pricing.
                </p>
                <p style="font-size: 16px; margin: 0 0 20px 0;">
                  In the meantime, we'll keep you updated on our progress and share tips on managing your subscriptions.
                </p>
                <p style="font-size: 16px; margin: 0 0 20px 0;">
                  Thanks for your interest, and we can't wait to help you save money!
                </p>
                <p style="font-size: 16px; margin: 30px 0 0 0;">
                  Best regards,<br>
                  The Cancel It Team
                </p>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error("Failed to send waitlist confirmation email:", emailError);
    }

    return NextResponse.json(
      { message: "Successfully added to waitlist" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    console.error("Waitlist submission error:", error);
    return NextResponse.json(
      { error: "Failed to add email to waitlist" },
      { status: 500 },
    );
  }
}

