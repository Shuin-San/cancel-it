import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { AppSidebar } from "~/components/app-sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar userEmail={session.user?.email ?? null} />
      <main className="flex-1 overflow-y-auto">
        <div className="py-8 px-4 w-full">{children}</div>
      </main>
    </div>
  );
}

