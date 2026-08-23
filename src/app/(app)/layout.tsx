import { requireUser } from "@/lib/auth";
import { SideNav } from "@/components/nav/side-nav";
import { BottomNav } from "@/components/nav/bottom-nav";
import { MobileHeader } from "@/components/nav/mobile-header";
import { Fab } from "@/components/nav/fab";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div>
      <SideNav userName={user.name ?? user.email} />
      <MobileHeader />
      <main className="md:pl-60 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </main>
      <Fab href="/expenses/new" label="Add expense" />
      <BottomNav />
    </div>
  );
}
