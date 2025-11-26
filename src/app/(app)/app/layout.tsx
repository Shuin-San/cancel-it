import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { AppSidebar } from "~/components/app-sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar userEmail={session.user?.email ?? null} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto w-full max-w-7xl px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

