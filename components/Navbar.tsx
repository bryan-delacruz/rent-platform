'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { LayoutDashboard, Building2, CreditCard, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/client';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { href: '/properties', label: t.nav.properties, icon: Building2 },
    { href: '/tenants', label: t.nav.tenants, icon: Users },
    { href: '/leases', label: t.nav.leases, icon: FileText },
    { href: '/payments', label: t.nav.payments, icon: CreditCard },
  ];

  return (
    <nav className="flex shrink-0 flex-col border-b bg-card p-4 md:h-screen md:w-64 md:border-b-0 md:border-r md:sticky md:top-0">
      <div className="mb-4 flex items-center justify-between px-2 md:mb-8 md:px-4">
        <Link href="/dashboard" className="text-xl font-bold text-primary md:text-2xl">
          Rent Platform
        </Link>
        <div className="md:hidden">
          <UserButton />
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto md:flex-col md:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 transition-colors md:px-4 md:py-3',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 px-2 md:mt-auto md:px-4">
        <LocaleSwitcher />
        <div className="hidden md:block">
          <UserButton />
        </div>
      </div>
    </nav>
  );
}
