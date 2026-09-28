import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GeneratePaymentsButton } from "@/components/GeneratePaymentsButton";
import { PaymentActions } from "@/components/PaymentActions";
import { PaymentStatusBadge } from "@/components/StatusBadge";
import { getPortfolio } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";
import { interpolate } from "@/lib/i18n";
import { getI18n } from "@/lib/i18n/server";

export default async function PaymentsPage() {
  const [{ locale, t }, { properties, tenants, leases, payments }] = await Promise.all([getI18n(), getPortfolio()]);
  const leaseById = new Map(leases.map((lease) => [lease.id, lease]));
  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const tenantById = new Map(tenants.map((tenant) => [tenant.id, tenant]));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t.payments.title}</h1>
        <GeneratePaymentsButton />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.payments.property}</TableHead>
              <TableHead>{t.payments.dueDate}</TableHead>
              <TableHead>{t.payments.amount}</TableHead>
              <TableHead>{t.common.status}</TableHead>
              <TableHead>{t.payments.paidOn}</TableHead>
              <TableHead className="text-right">{t.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const lease = leaseById.get(payment.leaseId);
              if (!lease) return null;
              const property = propertyById.get(lease.propertyId);
              const tenant = tenantById.get(lease.tenantId);
              const money = (value: number) => formatMoney(value, lease.currency, locale);
              return (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    <Link href={`/leases/${lease.id}`} className="hover:underline">
                      {property?.name ?? t.common.unknown}
                    </Link>
                    <div className="text-xs font-normal text-muted-foreground">{tenant?.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(payment.dueDate, locale)}</span>
                      {payment.overdueDays > 0 && (
                        <span className="text-xs font-medium text-red-600">
                          {interpolate(t.payments.daysLate, { count: payment.overdueDays })}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{money(payment.amount)}</span>
                      {payment.status === "PARTIAL" && (
                        <span className="text-xs font-medium text-green-700">
                          {interpolate(t.payments.partialPaid, { amount: money(payment.amountPaid) })}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>{payment.paidDate ? formatDate(payment.paidDate, locale) : "—"}</TableCell>
                  <TableCell className="text-right">
                    {tenant && property && (
                      <PaymentActions
                        payment={payment}
                        currency={lease.currency}
                        tenant={{ name: tenant.name, phone: tenant.phone }}
                        propertyName={property.name}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {t.payments.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
