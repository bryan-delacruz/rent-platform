'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, CreditCard, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard },
  { href: '/properties', label: 'Propiedades', icon: Building2 },
  { href: '/tenants', label: 'Arrendatarios', icon: Users },
  { href: '/leases', label: 'Contratos', icon: FileText },
  { href: '/payments', label: 'Recibos', icon: CreditCard },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col w-64 border-r bg-card h-screen p-4">
      <div className="mb-8 px-4">
        <h1 className="text-2xl font-bold text-primary">RentManager</h1>
      </div>
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
