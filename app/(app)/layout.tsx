import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/Navbar";
import { isDemoOwner } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth.protect();
  const { t } = await getI18n();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Navbar />
      <div className="flex min-w-0 flex-1 flex-col">
        {isDemoOwner(userId) && (
          <div className="border-b bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 md:px-8">
            {t.nav.demoBanner}
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
