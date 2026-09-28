import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/40 p-4">
      <Link href="/" className="text-2xl font-bold text-primary">
        Rent Platform
      </Link>
      {children}
      <LocaleSwitcher />
    </div>
  );
}
