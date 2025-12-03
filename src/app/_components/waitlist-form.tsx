"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to join waitlist");
      }

      // Handle duplicate email case
      if (data.duplicate) {
        toast.info("You are already registered on the waitlist!");
        setEmail("");
        return;
      }

      toast.success("Successfully joined the waitlist! Check your email for confirmation.");
      setEmail("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to join waitlist. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              placeholder="you@example.com"
              required
              className="h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                Notify Me
                <Mail className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            We&apos;ll only email you when we launch. Unsubscribe anytime.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

